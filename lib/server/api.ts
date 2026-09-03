import "server-only";
import { ZodError } from "zod";
import { getSessionUser } from "./auth";
import { canAccess, canManageInventory, type AppModule } from "@/types/auth";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  // Next may normalize request.url to localhost; the HTTP Host is the browser-facing authority.
  const host = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  let allowed = false;
  try {
    const parsed = new URL(origin ?? "");
    allowed =
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.host.toLowerCase() === host.toLowerCase();
  } catch {
    /* Missing or malformed origins are rejected. */
  }
  if (!allowed) throw new ApiError("Request origin is not allowed.", 403);
}
export async function apiUser(module: AppModule, write = false) {
  const user = await getSessionUser();
  if (!user) throw new ApiError("Please sign in to continue.", 401);
  if (
    !canAccess(user, module) ||
    (write && module === "inventory" && !canManageInventory(user))
  )
    throw new ApiError(
      "Your account does not have access to this action.",
      403,
    );
  return user;
}
export function apiError(error: unknown) {
  const status = error instanceof ApiError ? error.status : 400;
  return Response.json(
    {
      error:
        error instanceof ZodError
          ? error.issues
              .map((issue) => issue.path.join(".") + ": " + issue.message)
              .join(" · ")
          : error instanceof Error
            ? error.message
            : "The request could not be completed.",
    },
    { status },
  );
}
