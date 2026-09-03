import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import os from "node:os";

function resolveInitialDirectory(): string {
  if (process.env.FLAIR_DATA_DIR) {
    return path.resolve(process.env.FLAIR_DATA_DIR);
  }
  // On Vercel / AWS Lambda, the workspace root filesystem is read-only.
  // /tmp (os.tmpdir()) is the standard writable location.
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  ) {
    return path.join(os.tmpdir(), "flair-data");
  }
  return path.resolve(path.join(process.cwd(), ".data"));
}

let activeDataDirectory = resolveInitialDirectory();

async function ensureDataDirectory(): Promise<string> {
  try {
    await mkdir(activeDataDirectory, { recursive: true });
    return activeDataDirectory;
  } catch {
    // If mkdir fails (e.g. read-only filesystem on /var/task), automatically fallback to os.tmpdir()
    const fallback = path.join(os.tmpdir(), "flair-data");
    if (activeDataDirectory !== fallback) {
      activeDataDirectory = fallback;
      await mkdir(fallback, { recursive: true });
      return fallback;
    }
    throw new Error("Unable to create writable data directory: " + fallback);
  }
}

const shared = globalThis as typeof globalThis & {
  flairStoreQueues?: Map<string, Promise<unknown>>;
  flairStoreInitializers?: Map<string, Promise<unknown>>;
  flairMemoryStore?: Map<string, unknown>;
};
const queues = (shared.flairStoreQueues ??= new Map<
  string,
  Promise<unknown>
>());
const initializers = (shared.flairStoreInitializers ??= new Map<
  string,
  Promise<unknown>
>());
const memoryStore = (shared.flairMemoryStore ??= new Map<string, unknown>());

export async function readStore<T>(
  name: string,
  seed: () => T | Promise<T>,
): Promise<T> {
  if (memoryStore.has(name)) {
    return memoryStore.get(name) as T;
  }
  const file = path.join(activeDataDirectory, name + ".json");
  try {
    const data = JSON.parse(await readFile(file, "utf8")) as T;
    memoryStore.set(name, data);
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;

    // Check if a read-only template exists in workspace .data
    const templateFile = path.join(process.cwd(), ".data", name + ".json");
    try {
      if (path.resolve(templateFile) !== path.resolve(file)) {
        const templateData = JSON.parse(
          await readFile(templateFile, "utf8"),
        ) as T;
        memoryStore.set(name, templateData);
        writeStore(name, templateData).catch(() => {});
        return templateData;
      }
    } catch {
      // Template not present, proceed to seed()
    }

    let initialization = initializers.get(name);
    if (!initialization) {
      initialization = (async () => {
        try {
          const fresh = JSON.parse(await readFile(file, "utf8")) as T;
          memoryStore.set(name, fresh);
          return fresh;
        } catch (retryError) {
          if ((retryError as NodeJS.ErrnoException).code !== "ENOENT")
            throw retryError;
        }
        const initial = await seed();
        memoryStore.set(name, initial);
        await writeStore(name, initial);
        return initial;
      })();
      initializers.set(name, initialization);
    }
    try {
      return (await initialization) as T;
    } finally {
      if (initializers.get(name) === initialization) initializers.delete(name);
    }
  }
}

async function writeStore<T>(name: string, data: T) {
  memoryStore.set(name, data);
  try {
    const dir = await ensureDataDirectory();
    const file = path.join(dir, name + ".json");
    const temporary = file + "." + randomUUID() + ".tmp";
    await writeFile(temporary, JSON.stringify(data, null, 2), { mode: 0o600 });
    await rename(temporary, file);
  } catch (error) {
    console.warn(`[json-store] Non-fatal write error for "${name}":`, error);
  }
}

export async function mutateStore<T, R>(
  name: string,
  seed: () => T | Promise<T>,
  mutation: (data: T) => R | Promise<R>,
): Promise<R> {
  const previous = queues.get(name) ?? Promise.resolve();
  const operation = previous
    .catch(() => undefined)
    .then(async () => {
      const data = await readStore(name, seed);
      const result = await mutation(data);
      await writeStore(name, data);
      return result;
    });
  queues.set(name, operation);
  try {
    return await operation;
  } finally {
    if (queues.get(name) === operation) queues.delete(name);
  }
}
