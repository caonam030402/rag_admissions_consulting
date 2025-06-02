import { ERole } from "@/enums/auth";

/**
 * Role utilities để centralize role checking logic và tránh hardcode
 * 
 * @example
 * // In components:
 * import { RoleHelper } from "@/utils/roleHelper";
 * import { userService } from "@/services/user";
 * 
 * const MyComponent = () => {
 *   const { user } = userService.useProfile();
 *   
 *   if (RoleHelper.isAdmin(user?.role)) {
 *     return <AdminDashboard />;
 *   }
 *   
 *   return <UserDashboard />;
 * };
 */
export const RoleHelper = {
    /**
     * Check if role is Admin
     */
    isAdmin: (role?: any): boolean => {
        return role?.id === ERole.ADMIN || role?.name === "Admin";
    },

    /**
     * Check if role is User  
     */
    isUser: (role?: any): boolean => {
        return role?.id === ERole.USER || role?.name === "User";
    },

    /**
     * Get default redirect path based on role
     */
    getDefaultPath: (role?: any): string => {
        return RoleHelper.isAdmin(role) ? "/admin/manager/overview" : "/chat-bot";
    },

    /**
     * Get appropriate login path based on area
     */
    getLoginPath: (isAdminArea: boolean): string => {
        return isAdminArea ? "/admin/login" : "/login";
    },

    /**
     * Check if user can access admin features
     */
    canAccessAdmin: (role?: any): boolean => {
        return RoleHelper.isAdmin(role);
    },

    /**
     * Check if user can access user features (both admin and user can access)
     */
    canAccessUser: (role?: any): boolean => {
        return RoleHelper.isAdmin(role) || RoleHelper.isUser(role);
    },
};
