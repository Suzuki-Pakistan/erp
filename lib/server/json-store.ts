import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const dataDirectory = path.resolve(
  /* turbopackIgnore: true */
  process.env.FLAIR_DATA_DIR || path.join(process.cwd(), ".data"),
);
const shared = globalThis as typeof globalThis & {
  flairStoreQueues?: Map<string, Promise<unknown>>;
  flairStoreInitializers?: Map<string, Promise<unknown>>;
};
const queues = (shared.flairStoreQueues ??= new Map<
  string,
  Promise<unknown>
>());
const initializers = (shared.flairStoreInitializers ??= new Map<
  string,
  Promise<unknown>
>());

export async function readStore<T>(
  name: string,
  seed: () => T | Promise<T>,
): Promise<T> {
  const file = path.join(dataDirectory, name + ".json");
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    let initialization = initializers.get(name);
    if (!initialization) {
      initialization = (async () => {
        // A concurrent first reader may already have initialized while this read was pending.
        try {
          return JSON.parse(await readFile(file, "utf8")) as T;
        } catch (retryError) {
          if ((retryError as NodeJS.ErrnoException).code !== "ENOENT")
            throw retryError;
        }
        const initial = await seed();
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
  await mkdir(dataDirectory, { recursive: true });
  const file = path.join(dataDirectory, name + ".json");
  const temporary = file + "." + randomUUID() + ".tmp";
  await writeFile(temporary, JSON.stringify(data, null, 2), { mode: 0o600 });
  await rename(temporary, file);
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
