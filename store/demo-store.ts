"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createSeedData } from "@/data/mock";
import type {
  CompanySettings,
  CompanyWorkspace,
  DemoData,
  Location,
  PermissionPolicy,
  Role,
  User,
} from "@/types/core-setup";

interface DemoStore extends DemoData {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, changes: Partial<Location>) => void;
  duplicateLocation: (id: string) => void;
  deleteLocation: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, changes: Partial<User>) => void;
  addRole: (role: Role, policy: PermissionPolicy) => void;
  updateRole: (id: string, changes: Partial<Role>) => void;
  duplicateRole: (id: string) => void;
  deleteCustomRole: (id: string) => void;
  updateRolePermissions: (roleId: string, policy: PermissionPolicy) => void;
  updateCompanySettings: <K extends keyof CompanySettings>(
    section: K,
    value: CompanySettings[K],
  ) => void;
  addCompany: (company: CompanyWorkspace) => void;
  activateCompany: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  clearDemoState: () => void;
}

const seed = createSeedData();

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      ...seed,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addLocation: (location) =>
        set((state) => ({
          locations: [location, ...state.locations],
          activity: [
            {
              id: `act-location-${location.id}`,
              actor: "Maya Patel",
              action: "added",
              target: location.name,
              timestamp: "Just now",
              category: "Location",
            },
            ...state.activity,
          ],
        })),
      updateLocation: (id, changes) =>
        set((state) => ({
          locations: state.locations.map((location) =>
            location.id === id
              ? { ...location, ...changes, updatedAt: "Just now" }
              : location,
          ),
        })),
      duplicateLocation: (id) =>
        set((state) => {
          const source = state.locations.find((location) => location.id === id);
          if (!source) return state;
          const copy = {
            ...source,
            id: `${source.id}-copy-${Date.now()}`,
            name: `${source.name} Copy`,
            code: `${source.code.slice(0, 7)}CPY`,
            status: "setup" as const,
            updatedAt: "Just now",
          };
          return { locations: [copy, ...state.locations] };
        }),
      deleteLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((location) => location.id !== id),
          users: state.users.map((user) => ({
            ...user,
            locationIds: user.locationIds.filter(
              (locationId) => locationId !== id,
            ),
          })),
        })),
      addUser: (user) =>
        set((state) => ({
          users: [user, ...state.users],
          activity: [
            {
              id: `act-user-${user.id}`,
              actor: "Maya Patel",
              action: "added",
              target: `${user.firstName} ${user.lastName}`,
              timestamp: "Just now",
              category: "People",
            },
            ...state.activity,
          ],
        })),
      updateUser: (id, changes) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...changes } : user,
          ),
        })),
      addRole: (role, permissionPolicy) =>
        set((state) => ({
          roles: [...state.roles, role],
          permissions: { ...state.permissions, [role.id]: permissionPolicy },
        })),
      updateRole: (id, changes) =>
        set((state) => ({
          roles: state.roles.map((role) =>
            role.id === id ? { ...role, ...changes } : role,
          ),
        })),
      duplicateRole: (id) =>
        set((state) => {
          const source = state.roles.find((role) => role.id === id);
          const sourcePolicy = state.permissions[id];
          if (!source || !sourcePolicy) return state;
          const copyId = `${id}-copy-${Date.now()}`;
          return {
            roles: [
              ...state.roles,
              {
                ...source,
                id: copyId,
                name: `${source.name} Copy`,
                sourceRole: false,
              },
            ],
            permissions: {
              ...state.permissions,
              [copyId]: {
                ...structuredClone(sourcePolicy),
                roleId: copyId,
                updatedAt: "Just now",
              },
            },
          };
        }),
      deleteCustomRole: (id) =>
        set((state) => {
          if (state.roles.find((role) => role.id === id)?.sourceRole)
            return state;
          const nextPermissions = { ...state.permissions };
          delete nextPermissions[id];
          return {
            roles: state.roles.filter((role) => role.id !== id),
            users: state.users.map((user) =>
              user.roleId === id ? { ...user, roleId: "role-sales" } : user,
            ),
            permissions: nextPermissions,
          };
        }),
      updateRolePermissions: (roleId, permissionPolicy) =>
        set((state) => ({
          permissions: {
            ...state.permissions,
            [roleId]: { ...permissionPolicy, updatedAt: "Just now" },
          },
          activity: [
            {
              id: `act-perm-${Date.now()}`,
              actor: "Maya Patel",
              action: "updated",
              target: `${state.roles.find((role) => role.id === roleId)?.name ?? "Role"} permissions`,
              timestamp: "Just now",
              category: "Permissions",
            },
            ...state.activity,
          ],
        })),
      updateCompanySettings: (section, value) =>
        set((state) => {
          const companySettings = {
            ...state.companySettings,
            [section]: value,
          };
          return {
            companySettings,
            companies: state.companies.map((company) =>
              company.id === state.activeCompanyId
                ? {
                    ...company,
                    name: companySettings.businessProfile.displayName,
                    settings: companySettings,
                  }
                : company,
            ),
          };
        }),
      addCompany: (company) =>
        set((state) => ({
          companies: [company, ...state.companies],
          activeCompanyId: company.id,
          companySettings: company.settings,
          activity: [
            {
              id: `act-company-${company.id}`,
              actor: "Maya Patel",
              action: "added company",
              target: company.name,
              timestamp: "Just now",
              category: "Settings",
            },
            ...state.activity,
          ],
        })),
      activateCompany: (id) =>
        set((state) => {
          const company = state.companies.find((item) => item.id === id);
          return company
            ? {
                activeCompanyId: company.id,
                companySettings: company.settings,
              }
            : state;
        }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({
            ...item,
            read: true,
          })),
        })),
      resetDemoData: () => set({ ...createSeedData(), hasHydrated: true }),
      clearDemoState: () => {
        localStorage.removeItem("flair-erp-demo:v1");
        set({ ...createSeedData(), hasHydrated: true });
      },
    }),
    {
      name: "flair-erp-demo:v1",
      version: 2,
      skipHydration: true,
      partialize: (state) => ({
        locations: state.locations,
        users: state.users,
        roles: state.roles,
        permissions: state.permissions,
        companySettings: state.companySettings,
        companies: state.companies,
        activeCompanyId: state.activeCompanyId,
        activity: state.activity,
        notifications: state.notifications,
      }),
      migrate: (persistedState) => {
        const current = createSeedData();
        const persisted = persistedState as Partial<DemoStore>;
        const settings = persisted.companySettings ?? current.companySettings;
        return {
          ...persisted,
          companySettings: settings,
          companies: persisted.companies?.length
            ? persisted.companies
            : [
                {
                  ...current.companies[0],
                  name: settings.businessProfile.displayName,
                  settings,
                },
              ],
          activeCompanyId: persisted.activeCompanyId ?? current.activeCompanyId,
        } as DemoStore;
      },
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export function getRoleUserCount(roleId: string): number {
  return useDemoStore.getState().users.filter((user) => user.roleId === roleId)
    .length;
}
