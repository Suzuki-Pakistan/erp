export type LocationType = "retail" | "main-warehouse" | "ecommerce-warehouse";
export type RecordStatus = "active" | "setup" | "inactive";
export type UserStatus = "active" | "invited" | "inactive";
export type PermissionAction =
  "view" | "create" | "edit" | "delete" | "approve" | "export";

export interface Location {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  status: RecordStatus;
  city: string;
  state: string;
  country: string;
  address1: string;
  address2?: string;
  zip: string;
  manager: string;
  phone: string;
  email: string;
  timezone: string;
  staffCount: number;
  image: string;
  capacityLabel?: string;
  fulfillmentEnabled?: boolean;
  linkedRetailStoreId?: string;
  openingTime?: string;
  closingTime?: string;
  note?: string;
  fictional?: boolean;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone: string;
  roleId: string;
  locationIds: string[];
  status: UserStatus;
  lastActive: string;
  addedAt: string;
  avatar: string;
  timezone: string;
  operationalNotifications: boolean;
  passwordResetRequired: boolean;
  mfaState: "Enabled" | "Not enabled";
}

export interface Role {
  id: string;
  name: string;
  sourceRole: boolean;
  accessLevel: string;
  description: string;
  locationScope: "all" | "selected";
  permissionHighlights: string[];
}

export interface ModulePermission {
  moduleId: string;
  actions: Record<PermissionAction, boolean>;
}

export interface PermissionPolicy {
  roleId: string;
  modules: ModulePermission[];
  visibility: {
    pricing: boolean;
    productCost: boolean;
    purchasing: boolean;
    accounting: boolean;
    reports: boolean;
  };
  locationScope: "all" | "selected";
  selectedLocationIds: string[];
  updatedAt: string;
}

export interface CompanySettings {
  businessProfile: {
    displayName: string;
    legalName: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    description: string;
  };
  branding: {
    appDisplayName: string;
    accent: string;
    wordmarkVariant: "Full wordmark" | "Symbol";
  };
  regional: {
    currency: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    language: string;
  };
  defaults: {
    retailLocationId: string;
    mainWarehouseId: string;
    ecommerceWarehouseId: string;
    defaultUserStatus: UserStatus;
    locationCodePattern: string;
  };
  notificationDefaults: {
    accessChanges: boolean;
    newUsers: boolean;
    locationReminders: boolean;
    weeklyDigest: boolean;
  };
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  category: "Location" | "People" | "Permissions" | "Settings" | "System";
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  tone: "info" | "attention" | "success";
}

export interface DemoData {
  locations: Location[];
  users: User[];
  roles: Role[];
  permissions: Record<string, PermissionPolicy>;
  companySettings: CompanySettings;
  activity: ActivityItem[];
  notifications: NotificationItem[];
}

export const moduleDefinitions = [
  { id: "core", number: "01", name: "Core Setup" },
  { id: "inventory", number: "02", name: "Product & Inventory" },
  { id: "pos", number: "03", name: "Retail POS" },
  { id: "purchasing", number: "04", name: "Purchasing & Vendors" },
  { id: "wholesale", number: "05", name: "Wholesale & B2B Portal" },
  { id: "ecommerce", number: "06", name: "E-Commerce Hub" },
  { id: "reports", number: "07", name: "Reports & Dashboards" },
  { id: "forecasting", number: "08", name: "Smart Demand Forecasting" },
  { id: "accounting", number: "09", name: "Accounting & Finance" },
] as const;
