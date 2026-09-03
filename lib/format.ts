import type {
  LocationType,
  RecordStatus,
  UserStatus,
} from "@/types/core-setup";

export const locationTypeLabels: Record<LocationType, string> = {
  retail: "Retail Store",
  "main-warehouse": "Main Warehouse",
  "ecommerce-warehouse": "E-Commerce Warehouse",
};

export function statusLabel(status: RecordStatus | UserStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function initials(firstName: string, lastName = ""): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}
