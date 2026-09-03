import "server-only";
import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  canAccess,
  landingPath,
  type AppModule,
  type SessionUser,
} from "@/types/auth";
import { mutateStore, readStore } from "./json-store";

interface AuthAccount extends SessionUser {
  passwordHash: string;
}
interface StoredSession {
  tokenHash: string;
  userId: string;
  expiresAt: number;
}
interface AuthData {
  accounts: AuthAccount[];
  sessions: StoredSession[];
}
export const SESSION_COOKIE = "flair_session";
const lifetime = 60 * 60 * 12;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function publicAccount(account: AuthAccount): SessionUser {
  return {
    id: account.id,
    username: account.username,
    email: account.email,
    name: account.name,
    role: account.role,
    active: account.active,
    createdAt: account.createdAt,
  };
}

async function seedAuth(): Promise<AuthData> {
  const password = process.env.FLAIR_ADMIN_PASSWORD || "admin";
  if (process.env.NODE_ENV === "production" && password.length < 12) {
    throw new Error(
      "Set FLAIR_ADMIN_PASSWORD to at least 12 characters before production startup.",
    );
  }
  return {
    accounts: [
      {
        id: "account-admin",
        username: "admin",
        email: "admin@admin.com",
        name: "Admin",
        role: "admin",
        active: true,
        createdAt: new Date().toISOString(),
        passwordHash: hashPassword(password),
      },
    ],
    sessions: [],
  };
}

export async function authenticate(identifier: string, password: string) {
  return mutateStore<AuthData, { user: SessionUser; token: string } | null>(
    "auth",
    seedAuth,
    (data) => {
      const account = data.accounts.find(
        (item) =>
          item.username.toLowerCase() === identifier.toLowerCase() ||
          item.email.toLowerCase() === identifier.toLowerCase(),
      );
      if (
        !account ||
        !account.active ||
        !verifyPassword(password, account.passwordHash)
      )
        return null;
      if (process.env.NODE_ENV === "production" && password.length < 12) {
        throw new Error(
          "This account needs a password of at least 12 characters before production use. Update its password in the local workspace first.",
        );
      }
      const token = randomBytes(32).toString("base64url");
      data.sessions = data.sessions.filter(
        (item) => item.expiresAt > Date.now(),
      );
      data.sessions.push({
        tokenHash: tokenHash(token),
        userId: account.id,
        expiresAt: Date.now() + lifetime * 1000,
      });
      return { user: publicAccount(account), token };
    },
  );
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: lifetime,
    path: "/",
  });
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const data = await readStore<AuthData>("auth", seedAuth);
  const session = data.sessions.find(
    (item) =>
      item.tokenHash === tokenHash(token) && item.expiresAt > Date.now(),
  );
  const account =
    session &&
    data.accounts.find((item) => item.id === session.userId && item.active);
  if (
    account &&
    process.env.NODE_ENV === "production" &&
    verifyPassword("admin", account.passwordHash)
  )
    return null;
  return account ? publicAccount(account) : null;
});

export async function requirePageAccess(module: AppModule) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!canAccess(user, module)) redirect(landingPath(user));
  return user;
}

export async function logout() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token)
    await mutateStore<AuthData, void>("auth", seedAuth, (data) => {
      data.sessions = data.sessions.filter(
        (item) => item.tokenHash !== tokenHash(token),
      );
    });
  (await cookies()).delete(SESSION_COOKIE);
}

export async function listAccounts() {
  const data = await readStore<AuthData>("auth", seedAuth);
  return data.accounts.map(publicAccount);
}

export async function saveAccount(
  input: Omit<SessionUser, "id" | "createdAt"> & {
    id?: string;
    password?: string;
  },
) {
  return mutateStore<AuthData, SessionUser>("auth", seedAuth, (data) => {
    const duplicate = data.accounts.find(
      (item) =>
        item.id !== input.id &&
        (item.email.toLowerCase() === input.email.toLowerCase() ||
          item.username.toLowerCase() === input.username.toLowerCase()),
    );
    if (duplicate) throw new Error("That username or email is already in use.");
    const existing = data.accounts.find((item) => item.id === input.id);
    if (input.id && !existing) throw new Error("Account not found.");
    if (
      process.env.NODE_ENV === "production" &&
      input.password &&
      input.password.length < 12
    )
      throw new Error(
        "Production accounts require passwords of at least 12 characters.",
      );
    if (
      existing?.id === "account-admin" &&
      (!input.active || input.role !== "admin")
    )
      throw new Error(
        "The bootstrap administrator must remain active with administrator access.",
      );
    if (!existing && !input.password)
      throw new Error("A password is required for a new account.");
    const account: AuthAccount = {
      ...input,
      id: existing?.id ?? randomUUID(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      passwordHash: input.password
        ? hashPassword(input.password)
        : existing!.passwordHash,
    };
    delete (account as AuthAccount & { password?: string }).password;
    if (existing)
      data.accounts = data.accounts.map((item) =>
        item.id === existing.id ? account : item,
      );
    else data.accounts.push(account);
    if (existing)
      data.sessions = data.sessions.filter(
        (item) => item.userId !== existing.id,
      );
    return publicAccount(account);
  });
}
