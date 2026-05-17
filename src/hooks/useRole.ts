import { useProfile } from "@/hooks/useHotel";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  PROPERTY_ADMIN = "PROPERTY_ADMIN",
  MANAGER = "MANAGER",
  FRONT_DESK = "FRONT_DESK",
  HOUSEKEEPING = "HOUSEKEEPING",
  ACCOUNTANT = "ACCOUNTANT",
  EDA = "EDA"
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  "SUPER_ADMIN": ["*"],
  "ADMIN": ["MANAGE_USERS", "VIEW_FINANCIALS", "SYSTEM_CONFIG", "MANAGE_ROOMS", "CREATE_BOOKING", "VIEW_BOOKING"],
  "PROPERTY_ADMIN": ["MANAGE_USERS", "MANAGE_ROOMS", "VIEW_FINANCIALS", "CREATE_BOOKING", "VIEW_BOOKING"],
  "MANAGER": ["MANAGE_ROOMS", "CREATE_BOOKING", "VIEW_BOOKING"],
  "AGENT": ["CREATE_BOOKING", "VIEW_BOOKING", "VIEW_FINANCIALS"],
  "FRONT_DESK": ["CREATE_BOOKING", "VIEW_BOOKING"],
  "HOUSEKEEPING": ["MANAGE_ROOMS"],
  "ACCOUNTANT": ["VIEW_FINANCIALS"],
  "EDA": ["CREATE_BOOKING", "VIEW_BOOKING"]
};

export function useRole() {
  const { profile, isLoading } = useProfile();
  
  const currentRole = profile?.role as UserRole | undefined;
  const enabledModules = profile?.enabled_modules || [];

  const isAdmin = currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.ADMIN;
  const isAgent = currentRole === UserRole.AGENT;
  
  // High-level UI visibility guards
  const canViewGlobalUsers = isAdmin;
  const canViewAgencyTeam = isAgent || isAdmin;

  const hasPermission = (permission: string): boolean => {
    if (!currentRole) return false;
    
    const basePerms = ROLE_PERMISSIONS[currentRole] || [];
    const dynamicPerms = profile?.active_permissions || [];
    const allPerms = Array.from(new Set([...basePerms, ...dynamicPerms]));
    
    if (allPerms.includes("*")) return true;
    return allPerms.includes(permission);
  };

  // Determines what roles the current user is allowed to assign when creating a new user
  const getAllowedCreationRoles = (): string[] => {
    if (!currentRole) return [];

    if (currentRole === UserRole.SUPER_ADMIN) {
      return Object.values(UserRole);
    }

    if (currentRole === UserRole.ADMIN) {
      // Admins can create any internal/B2B role
      return Object.values(UserRole);
    }

    if (currentRole === UserRole.AGENT) {
      // Agents can strictly only create these sub-roles
      return [
        UserRole.PROPERTY_ADMIN, 
        UserRole.MANAGER, 
        UserRole.FRONT_DESK, 
        UserRole.EDA
      ];
    }
    
    if (currentRole === UserRole.PROPERTY_ADMIN) {
      return [
        UserRole.MANAGER,
        UserRole.FRONT_DESK,
        UserRole.HOUSEKEEPING
      ];
    }

    // Default: no creation rights
    return [];
  };

  return {
    currentRole,
    enabledModules,
    isLoading,
    isAdmin,
    isAgent,
    canViewGlobalUsers,
    canViewAgencyTeam,
    getAllowedCreationRoles,
    hasPermission
  };
}
