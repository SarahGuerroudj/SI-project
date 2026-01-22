/**
 * Role-Based Dashboard Router
 * ============================
 * Routes users to appropriate dashboard based on their role
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../../pages/Dashboard';  // Manager/Admin dashboard
import ClientDashboard from '../../features/dashboards/ClientDashboard';
import DriverDashboard from '../../features/dashboards/DriverDashboard';

const DashboardRouter: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    // Redirect to home if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    // Route based on role
    switch (user.role?.toLowerCase()) {
        case 'client':
            return <ClientDashboard />;

        case 'driver':
            return <DriverDashboard />;

        case 'admin':
        case 'manager':
            return <Dashboard />;

        default:
            // Default to client dashboard for unknown roles
            return <ClientDashboard />;
    }
};

export default DashboardRouter;
