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
    Tag
} from 'lucide-react';
import { NavItem } from '../types/navigation';

export const defaultMainNavItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'shipments', name: 'Shipments', icon: <Package size={20} />, path: '/shipments' },
    { id: 'routes', name: 'Routes', icon: <Map size={20} />, path: '/routes' },
    { id: 'billing', name: 'Billing', icon: <CreditCard size={20} />, path: '/billing' },
    { id: 'incidents', name: 'Incidents', icon: <AlertTriangle size={20} />, path: '/incidents' },
    { id: 'complaints', name: 'Complaints', icon: <MessageSquare size={20} />, path: '/complaints' },
    { id: 'favorites', name: 'Favorites', icon: <Star size={20} />, path: '/favorites' },
    { id: 'resources-section', name: 'Resources', icon: <Box size={20} />, path: '', type: 'resources' }
];

export const defaultResourceItems: NavItem[] = [
    { id: 'clients', name: 'Clients', icon: <Users size={18} />, path: '/clients' },
    { id: 'drivers', name: 'Drivers', icon: <Users size={18} />, path: '/drivers' },
    { id: 'fleet', name: 'Fleet', icon: <Truck size={18} />, path: '/fleet' },
    { id: 'service-types', name: 'Service Types', icon: <Tag size={18} />, path: '/service-types' },
    { id: 'destinations', name: 'Destinations', icon: <Navigation size={18} />, path: '/destinations' },
    { id: 'pricing', name: 'Pricing', icon: <DollarSign size={18} />, path: '/pricing' },
];
