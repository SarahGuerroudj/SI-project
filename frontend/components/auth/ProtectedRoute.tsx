/**
 * Protected Route Wrapper
 * =======================
 * Restricts route access based on user roles
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedR

    oles: string[];
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    redirectTo = '/unauthorized'
}) => {
    const { user, isAuthenticated } = useAuth();

    // Not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check if user's role is allowed
    const userRole = user?.role?.toLowerCase() || '';
    const hasAccess = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

    if (!hasAccess) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};
