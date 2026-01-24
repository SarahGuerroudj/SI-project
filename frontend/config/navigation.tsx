import React from 'react';
import {
    LayoutDashboard,
    Package,
    Users,
    Map,
    CreditCard,
    AlertTriangle,
    MessageSquare,
    Truck,
    Navigation,
    DollarSign,
    Box,
    Clock,
    FileText,
    Star,
    Tag,
    Shield
} from 'lucide-react';
import { NavItem } from '../types/navigation';

export const defaultMainNavItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', allowedRoles: ['admin', 'manager', 'driver'] },
    { id: 'client-dashboard', name: 'Client Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', allowedRoles: ['client'] },
    { id: 'shipments', name: 'Shipments', icon: <Package size={20} />, path: '/shipments', allowedRoles: ['admin', 'manager', 'client', 'driver'] },
    { id: 'routes', name: 'Routes', icon: <Map size={20} />, path: '/routes', allowedRoles: ['admin', 'manager', 'driver'] },
    { id: 'billing', name: 'Billing', icon: <CreditCard size={20} />, path: '/billing', allowedRoles: ['admin', 'manager'] },
    { id: 'incidents', name: 'Incidents', icon: <AlertTriangle size={20} />, path: '/incidents', allowedRoles: ['admin', 'manager', 'driver'] },
    { id: 'complaints', name: 'Complaints', icon: <MessageSquare size={20} />, path: '/complaints', allowedRoles: ['admin', 'manager', 'client'] },
    { id: 'favorites', name: 'Favorites', icon: <Star size={20} />, path: '/favorites', allowedRoles: ['admin', 'manager'] },
    { id: 'resources-section', name: 'Resources', icon: <Box size={20} />, path: '', type: 'resources', allowedRoles: ['admin', 'manager'] }
];

export const defaultResourceItems: NavItem[] = [
    { id: 'clients', name: 'Clients', icon: <Users size={18} />, path: '/clients', allowedRoles: ['admin', 'manager'] },
    { id: 'drivers', name: 'Drivers', icon: <Users size={18} />, path: '/drivers', allowedRoles: ['admin', 'manager'] },
    { id: 'fleet', name: 'Fleet', icon: <Truck size={18} />, path: '/fleet', allowedRoles: ['admin', 'manager'] },
    { id: 'service-types', name: 'Service Types', icon: <Tag size={18} />, path: '/service-types', allowedRoles: ['admin', 'manager'] },
    { id: 'destinations', name: 'Destinations', icon: <Navigation size={18} />, path: '/destinations', allowedRoles: ['admin', 'manager'] },
    { id: 'pricing', name: 'Pricing', icon: <DollarSign size={18} />, path: '/pricing', allowedRoles: ['admin', 'manager'] },
    { id: 'audit-logs', name: 'Audit Logs', icon: <Shield size={18} />, path: '/audit-logs', allowedRoles: ['admin'] },
];

/**
 * Filter navigation items based on user role
 */
export const filterNavByRole = (items: NavItem[], userRole?: string): NavItem[] => {
    if (!userRole) return [];

    return items.filter(item => {
        // If no allowedRoles specified, show to everyone
        if (!item.allowedRoles || item.allowedRoles.length === 0) return true;

        // Check if user's role is in allowedRoles
        return item.allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase());
    });
};
