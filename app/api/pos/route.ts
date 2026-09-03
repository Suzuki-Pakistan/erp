import { createInventorySeed } from "@/data/inventory";
import { posCommandSchema } from "@/lib/pos-schema";
import { applyPosCommand, posSnapshot } from "@/lib/pos-domain";
import { apiError, apiUser, sameOrigin, ApiError } from "@/lib/server/api";
import { mutateStore, readStore } from "@/lib/server/json-store";
export async function GET() {
  try {
    const user = await apiUser("pos");
    const data = await readStore("inventory", createInventorySeed);
    return Response.json(
      { data: posSnapshot(data, user) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await apiUser("pos", true);
    const body = await request.text();
    if (body.length > 100_000) throw new ApiError("Request is too large.", 413);
    const command = posCommandSchema.parse(JSON.parse(body));
    const result = await mutateStore(
      "inventory",
      createInventorySeed,
      (data) => {
        const result = applyPosCommand(data, command, user);
        return { ...result, data: posSnapshot(data, user) };
      },
    );
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
