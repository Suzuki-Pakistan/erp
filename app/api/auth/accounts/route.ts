import { z } from "zod";
import { listAccounts, saveAccount } from "@/lib/server/auth";
import { apiError, apiUser, sameOrigin, ApiError } from "@/lib/server/api";
export async function GET() {
  try {
    await apiUser("core");
    return Response.json(
      { accounts: await listAccounts() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await apiUser("core");
    const input = z
      .object({
        id: z.string().optional(),
        name: z.string().trim().min(2),
        username: z
          .string()
          .trim()
          .min(3)
          .regex(/^[a-zA-Z0-9._-]+$/),
        email: z.email(),
        role: z.enum([
          "admin",
          "inventory-manager",
          "inventory-viewer",
          "pos-manager",
          "cashier",
        ]),
        active: z.boolean(),
        password: z.string().min(8).max(200).optional(),
      })
      .parse(await request.json());
    if (input.id === user.id)
      throw new ApiError(
        "Use another administrator to modify the account you are currently signed in with.",
      );
    return Response.json({ account: await saveAccount(input) });
  } catch (error) {
    return apiError(error);
  }
}
