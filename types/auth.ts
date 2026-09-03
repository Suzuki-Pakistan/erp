export type AccessRole =
  | "admin"
  | "inventory-manager"
  | "inventory-viewer"
  | "pos-manager"
  | "cashier";
export type AppModule = "core" | "inventory" | "pos";

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: AccessRole;
  active: boolean;
  createdAt: string;
}

export const accessRoles: Record<
  AccessRole,
  { label: string; description: string }
> = {
  admin: {
    label: "Administrator",
    description: "Core Setup, inventory and full Retail POS access",
  },
  "inventory-manager": {
    label: "Inventory manager",
    description: "Manage catalog, pricing and stock operations",
  },
  "inventory-viewer": {
    label: "Inventory viewer",
    description: "Read-only catalog and stock visibility; costs hidden",
  },
  "pos-manager": {
    label: "POS manager",
    description:
      "Checkout, returns, customers, tax configuration and all shift reports",
  },
  cashier: {
    label: "Cashier",
    description:
      "Checkout, customers and own shifts; retail pricing and discounts up to 10%",
  },
};

export function canAccess(user: SessionUser, module: AppModule) {
  if (!user.active) return false;
  if (user.role === "admin") return true;
  if (module === "pos") return ["pos-manager", "cashier"].includes(user.role);
  return (
    module === "inventory" &&
    ["inventory-manager", "inventory-viewer"].includes(user.role)
  );
}

export function canManageInventory(user: SessionUser) {
  return user.active && ["admin", "inventory-manager"].includes(user.role);
}

export function canManagePos(user: SessionUser) {
  return user.active && ["admin", "pos-manager"].includes(user.role);
}

export function landingPath(user: SessionUser) {
  return user.role === "admin"
    ? "/core-setup"
    : canAccess(user, "pos")
      ? "/retail-pos"
      : "/product-inventory";
}
