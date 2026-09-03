import { z } from "zod";
import { authenticate, setSessionCookie } from "@/lib/server/auth";
import { apiError, sameOrigin, ApiError } from "@/lib/server/api";
import { landingPath } from "@/types/auth";

const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = z
      .object({
        identifier: z.string().trim().min(1).max(200),
        password: z.string().min(1).max(200),
      })
      .parse(await request.json());
    const key = input.identifier.toLowerCase();
    const attempt = attempts.get(key);
    if (attempt && attempt.until > Date.now() && attempt.count >= 8)
      throw new ApiError(
        "Too many attempts. Please try again in 10 minutes.",
        429,
      );
    const result = await authenticate(input.identifier, input.password);
    if (!result) {
      attempts.set(key, {
        count: attempt && attempt.until > Date.now() ? attempt.count + 1 : 1,
        until: Date.now() + 600000,
      });
      throw new ApiError("The username/email or password is incorrect.", 401);
    }
    attempts.delete(key);
    await setSessionCookie(result.token);
    return Response.json({
      user: result.user,
      redirectTo: landingPath(result.user),
    });
  } catch (error) {
    return apiError(error);
  }
}
