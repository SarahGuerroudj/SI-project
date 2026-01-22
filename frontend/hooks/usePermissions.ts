/**
 * Frontend Permission Hook
 * ========================
 * Provides role-based permission checks for UI elements and routing
 */
import { useAuth } from '../contexts/AuthContext';

export interface Permissions {
    // Admin only
    createManager: boolean;
    deleteUsers: boolean;

    // Manager & Admin
    manageFleet: boolean;
    manageDrivers: boolean;
    createRoutes: boolean;
    viewBilling: boolean;
    viewDashboard: boolean;
    viewComplaints: boolean;
    managePricing: boolean;

    // Client specific
    viewOwnShipments: boolean;
    createShipment: boolean;
    createComplaint: boolean;

    // Driver specific
    viewAssignedRoutes: boolean;
    completeDelivery: boolean;
    reportIncident: boolean;
}

export const usePermissions = (): Permissions => {
    const { user } = useAuth();

    const role = user?.role?.toLowerCase() || '';

    return {
        // Admin only permissions
        createManager: role === 'admin',
        deleteUsers: role === 'admin',

        // Manager & Admin permissions
        manageFleet: ['admin', 'manager'].includes(role),
        manageDrivers: ['admin', 'manager'].includes(role),
        createRoutes: ['admin', 'manager'].includes(role),
        viewBilling: ['admin', 'manager'].includes(role),
        viewDashboard: ['admin', 'manager'].includes(role),
        viewComplaints: ['admin', 'manager'].includes(role),
        managePricing: ['admin', 'manager'].includes(role),

        // Client permissions
        viewOwnShipments: ['admin', 'manager', 'client'].includes(role),
        createShipment: ['admin', 'manager', 'client'].includes(role),
        createComplaint: !!user, // Any authenticated user

        // Driver permissions
        viewAssignedRoutes: ['admin', 'manager', 'driver'].includes(role),
        completeDelivery: ['admin', 'driver'].includes(role),
        reportIncident: ['admin', 'driver'].includes(role),
    };
};

/**
 * Helper function to check if user has any of the specified roles
 */
export const hasAnyRole = (user: any, roles: string[]): boolean => {
    if (!user || !user.role) return false;
    return roles.map(r => r.toLowerCase()).includes(user.role.toLowerCase());
};

/**
 * Helper function to check if user has a specific role
 */
export const hasRole = (user: any, role: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.toLowerCase() === role.toLowerCase();
};
