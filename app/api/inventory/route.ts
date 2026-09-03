import { createInventorySeed } from "@/data/inventory";
import { inventoryCommandSchema } from "@/lib/inventory-schema";
import { applyInventoryCommand } from "@/lib/inventory-domain";
import { apiError, apiUser, sameOrigin } from "@/lib/server/api";
import { mutateStore, readStore } from "@/lib/server/json-store";
import type { InventoryData } from "@/types/inventory";
function redactCosts(data: InventoryData) {
  return {
    ...data,
    products: data.products.map((p) => ({
      ...p,
      averageCost: 0,
      lastCost: 0,
      lowestPrice: 0,
    })),
    movements: data.movements.map((m) => ({ ...m, unitCost: 0 })),
    operations: data.operations.map((o) => ({
      ...o,
      freight: 0,
      discount: 0,
      lines: o.lines.map((l) => ({ ...l, unitCost: 0 })),
    })),
  };
}
function inventoryOnly(data: InventoryData): InventoryData {
  const { pos: _pos, ...inventory } = data;
  void _pos;
  return inventory;
}
export async function GET() {
  try {
    const user = await apiUser("inventory");
    const data = await readStore("inventory", createInventorySeed);
    return Response.json(
      {
        data:
          user.role === "inventory-viewer"
            ? redactCosts(inventoryOnly(data))
            : inventoryOnly(data),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await apiUser("inventory", true);
    const command = inventoryCommandSchema.parse(await request.json());
    const result = await mutateStore<
      InventoryData,
      { message: string; data: InventoryData }
    >("inventory", createInventorySeed, (data) => {
      const next = structuredClone(data);
      const message = applyInventoryCommand(next, command, user.name);
      Object.assign(data, next);
      return { message, data: inventoryOnly(data) };
    });
    return Response.json(result);
  } catch (error) {
    return apiError(error);
  }
}
