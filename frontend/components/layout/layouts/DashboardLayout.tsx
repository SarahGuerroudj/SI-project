import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Zap,
    LogIn,
    Menu,
    X,
    ChevronDown,
    ChevronUp,
    FolderOpen,
    GripVertical,
    Settings,
    Bell,
    PanelLeft
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Chatbot from '../../ui/Chatbot';
import { useAuth } from '../../../contexts/AuthContext';
import { usePersistentNav } from '../../../hooks/usePersistentNav';
import { useFavorites } from '../../../contexts/FavoritesContext';
import { useToast } from '../../../contexts/ToastContext';
import { defaultMainNavItems, defaultResourceItems, filterNavByRole } from '../../../config/navigation';
import { NavItem } from '../../../types/navigation';

/**
 * Props for the DashboardLayout component.
 */
interface DashboardLayoutProps {
    children: React.ReactNode; // The content to render inside the main area
}

/**
 * MobileNavIcon helper component.
 * Abstracts the reusable link styling for the mobile menu to reduce code duplication.
 */
const MobileNavLink: React.FC<{
    item: NavItem;
    onClick: () => void;
}> = ({ item, onClick }) => (
    <Link
        to={item.path || '#'}
        onClick={onClick}
        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
        <span className="mr-3">{item.icon}</span>
        {item.name}
    </Link>
);

/**
 * DashboardLayout Component.
 * 
 * Provides the framing for authenticated pages:
 * - Sidebar with draggable navigation
 * - Header with mobile menu toggle and notifications
 * - Main content area
 * - Chatbot overlay
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user, isAuthenticated, isLoading, openModal } = useAuth();
    const { addFavorite } = useFavorites();
    const { addToast } = useToast();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Filter navigation based on user role
    // Filter navigation based on user role
    const filteredMainNav = useMemo(() => filterNavByRole(defaultMainNavItems, user?.role), [user?.role]);
    const filteredResourceNav = useMemo(() => filterNavByRole(defaultResourceItems, user?.role), [user?.role]);

    // Use the custom hook to manage persistent drag-and-drop ordering for both lists
    const { items: mainNavItems, onDragEnd: onMainDragEnd } = usePersistentNav<NavItem>('navOrder', filteredMainNav);
    const { items: resourceItems, onDragEnd: onResourceDragEnd } = usePersistentNav<NavItem>('resourceNavOrder', filteredResourceNav);



    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden selection:bg-lime-400 selection:text-slate-900 transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`w-64 bg-white dark:bg-slate-900 flex-shrink-0 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 z-20 transition-all duration-300 ${isSidebarCollapsed ? '-ml-64' : ''}`}>
                <div className="p-8">
                    <Link to="/" className="flex items-center gap-3 mb-1 group">
                        <div className="bg-gradient-to-br from-lime-400 to-lime-600 p-1.5 rounded-lg shadow-sm">
                            <Zap className="text-slate-900 fill-slate-900" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-none">
                                Route<span className="text-lime-500 dark:text-lime-400">Mind</span>
                            </span>
                        </div>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase ml-11 mt-1">AI Logistics</p>
                </div>

                {/* Main Navigation */}
                <DragDropContext onDragEnd={onMainDragEnd}>
                    <Droppable droppableId="nav-items">
                        {(provided) => (
                            <nav
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="flex-1 px-4 space-y-2 overflow-y-auto"
                            >
                                {mainNavItems.map((item, index) => {
                                    const isResourceSection = item.type === 'resources';
                                    const isActive = !isResourceSection && location.pathname === item.path;
                                    return (
                                        <React.Fragment key={item.id}>
                                            <Draggable draggableId={item.id} index={index}>
                                                {(dragProvided, snapshot) => (
                                                    <div
                                                        ref={dragProvided.innerRef}
                                                        {...dragProvided.draggableProps}
                                                        className={`flex items-start group ${snapshot.isDragging ? 'opacity-80' : ''}`}
                                                        onContextMenu={(e) => {
                                                            e.preventDefault();
                                                            // Logic to add to favorites
                                                            if (!item.path || item.id === 'resources-section') return;

                                                            const favItem = {
                                                                id: item.id,
                                                                title: item.name,
                                                                description: `Quick access to ${item.name}`,
                                                                meta: { path: item.path }
                                                            };
                                                            addFavorite(favItem);
                                                            addToast('success', `Added ${item.name} to favorites`);
                                                        }}
                                                    >
                                                        <div
                                                            {...dragProvided.dragHandleProps}
                                                            className="p-2 -ml-1 mr-1 text-slate-400 hover:text-lime-500 cursor-grab active:cursor-grabbing"
                                                            aria-label="Drag to reorder"
                                                        >
                                                            <GripVertical size={16} />
                                                        </div>
                                                        {isResourceSection ? (
                                                            <div className="flex-1">
                                                                <button
                                                                    onClick={() => setResourcesOpen(!resourcesOpen)}
                                                                    className="flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-colors duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    type="button"
                                                                >
                                                                    <span className="mr-3">
                                                                        <FolderOpen size={20} className={resourcesOpen ? 'text-lime-500' : 'text-slate-400'} />
                                                                    </span>
                                                                    {item.name}
                                                                    <span className="ml-auto">
                                                                        {resourcesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                    </span>
                                                                </button>

                                                                {resourcesOpen && (
                                                                    <div className="mt-1 ml-8 space-y-1">
                                                                        <DragDropContext onDragEnd={onResourceDragEnd}>
                                                                            <Droppable droppableId="resource-items">
                                                                                {(resourceProvided) => (
                                                                                    <div
                                                                                        {...resourceProvided.droppableProps}
                                                                                        ref={resourceProvided.innerRef}
                                                                                        className="space-y-1"
                                                                                    >
                                                                                        {resourceItems.map((resource, resourceIndex) => {
                                                                                            const isResourceActive = location.pathname === resource.path;
                                                                                            return (
                                                                                                <React.Fragment key={resource.id}>
                                                                                                    <Draggable draggableId={resource.id} index={resourceIndex}>
                                                                                                        {(resProvided, resSnapshot) => (
                                                                                                            <div
                                                                                                                ref={resProvided.innerRef}
                                                                                                                {...resProvided.draggableProps}
                                                                                                                className={`flex items-center group ${resSnapshot.isDragging ? 'opacity-80' : ''}`}
                                                                                                                onContextMenu={(e) => {
                                                                                                                    e.preventDefault();
                                                                                                                    const favItem = {
                                                                                                                        id: resource.id,
                                                                                                                        title: resource.name,
                                                                                                                        description: `Quick access to ${resource.name}`,
                                                                                                                        meta: { path: resource.path }
                                                                                                                    };
                                                                                                                    addFavorite(favItem);
                                                                                                                    addToast('success', `Added to favorites`);
                                                                                                                }}
                                                                                                            >
                                                                                                                <div
                                                                                                                    {...resProvided.dragHandleProps}
                                                                                                                    className="p-1 -ml-1 mr-0.5 text-slate-400 hover:text-lime-500 cursor-grab active:cursor-grabbing"
                                                                                                                    aria-label="Drag to reorder"
                                                                                                                >
                                                                                                                    <GripVertical size={14} />
                                                                                                                </div>
                                                                                                                <Link
                                                                                                                    to={resource.path || '#'}
                                                                                                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 flex-1 ${isResourceActive
                                                                                                                        ? 'bg-lime-400/20 text-lime-500 dark:text-lime-400'
                                                                                                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                                                                                                        }`}
                                                                                                                >
                                                                                                                    <span className="mr-2">{resource.icon}</span>
                                                                                                                    {resource.name}
                                                                                                                </Link>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </Draggable>
                                                                                                </React.Fragment>
                                                                                            );
                                                                                        })}
                                                                                        {resourceProvided.placeholder}
                                                                                    </div>
                                                                                )}
                                                                            </Droppable>
                                                                        </DragDropContext>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                to={item.path || '#'}
                                                                className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 flex-1 group ${isActive
                                                                    ? 'bg-lime-400 text-slate-900 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                                                    }`}
                                                            >
                                                                <span className={`mr-3 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-lime-500 dark:group-hover:text-lime-400'}`}>
                                                                    {item.icon}
                                                                </span>
                                                                {item.name}
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        </React.Fragment>
                                    );
                                })}
                                {provided.placeholder}
                            </nav>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="mt-auto px-6 py-5 border-t border-slate-200 dark:border-slate-800">
                    {isAuthenticated && user ? (
                        <div className="flex items-center justify-between gap-3">
                            <Link to="/account" className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-lime-600 dark:text-lime-400 border border-slate-300 dark:border-slate-600">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.username}</p>
                                    <p className="text-xs text-slate-500">{user.role || 'Manager'}</p>
                                </div>
                            </Link>
                            <Link to="/settings" className="text-slate-500 hover:text-lime-500 dark:hover:text-lime-400" title="Settings">
                                <Settings size={20} />
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={openModal}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                            Log In
                        </button>
                    )}
                </div>
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex flex-col gap-4 p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-4">
                        {/* Header Left: Mobile menu toggle for dashboard */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                            <button
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="hidden md:flex p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
                            >
                                <PanelLeft size={20} />
                            </button>
                            <div className="text-sm font-medium text-slate-900 dark:text-white md:hidden">
                                Route<span className="text-lime-500">Mind</span>
                            </div>
                        </div>

                        <Link
                            to="/notifications"
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 transition-colors relative group"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-lime-500 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.8)]"></span>
                        </Link>
                    </div>
                </header>

                {/* Mobile Sidebar Overlay for Dashboard */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
                            onClick={() => setMobileMenuOpen(false)}
                        ></div>

                        {/* Sidebar Slide-in */}
                        <aside className="relative w-64 bg-white dark:bg-slate-900 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Zap className="text-lime-500" size={20} />
                                    <span className="text-xl font-bold dark:text-white">Route<span className="text-lime-500">Mind</span></span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                                {/* Main Nav Items (Mobile) */}
                                {mainNavItems.map(item => (
                                    <MobileNavLink
                                        key={item.id}
                                        item={item}
                                        onClick={() => setMobileMenuOpen(false)}
                                    />
                                ))}

                                {/* Resource Items (Mobile) */}
                                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resources</p>
                                    {resourceItems.map(item => (
                                        <MobileNavLink
                                            key={item.id}
                                            item={item}
                                            onClick={() => setMobileMenuOpen(false)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                                {isAuthenticated ? (
                                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                                        <LogIn size={18} className="mr-2" /> Log Out
                                    </button>
                                ) : (
                                    <button onClick={() => { openModal(); setMobileMenuOpen(false); }} className="w-full py-2 bg-lime-400 text-slate-900 font-bold rounded-lg s">
                                        Log In
                                    </button>
                                )}
                            </div>
                        </aside>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth z-10">
                    {children}
                </main>

                {/* Chatbot Overlay */}
                <Chatbot />
            </div>
        </div>
    );
};

export default DashboardLayout;
