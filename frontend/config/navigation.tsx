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
    Star
} from 'lucide-react';
import { NavItem } from '../types/navigation';

export const defaultMainNavItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'shipments', name: 'Shipments', icon: <Package size={20} />, path: '/shipments' },
    { id: 'clients', name: 'Clients', icon: <Users size={20} />, path: '/clients' },
    { id: 'routes', name: 'Routes', icon: <Map size={20} />, path: '/routes' },
    { id: 'billing', name: 'Billing', icon: <CreditCard size={20} />, path: '/billing' },
    { id: 'incidents', name: 'Incidents', icon: <AlertTriangle size={20} />, path: '/incidents' },
    { id: 'complaints', name: 'Complaints', icon: <MessageSquare size={20} />, path: '/complaints' },
    { id: 'favorites', name: 'Favorites', icon: <Star size={20} />, path: '/favorites' },
    { id: 'resources-section', name: 'Resources', icon: <Box size={20} />, path: '', type: 'resources' }
];

export const defaultResourceItems: NavItem[] = [
    { id: 'drivers', name: 'Drivers', icon: <Users size={18} />, path: '/drivers' },
    { id: 'fleet', name: 'Fleet', icon: <Truck size={18} />, path: '/fleet' },
    { id: 'destinations', name: 'Destinations', icon: <Navigation size={18} />, path: '/destinations' },
    { id: 'pricing', name: 'Pricing', icon: <DollarSign size={18} />, path: '/pricing' },
    { id: 'service-types', name: 'Service Types', icon: <Clock size={18} />, path: '/service-types' },
    { id: 'resources', name: 'All Resources', icon: <FileText size={18} />, path: '/resources' }
];
