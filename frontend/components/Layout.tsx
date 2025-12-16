import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  User,
  Package,
  Map,
  MapPin,
  FileText,
  AlertTriangle,
  Bell,
  Settings,
  Zap,
  LogIn,
  Menu,
  X,
  MessageSquare,
  Star,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  List,
  DollarSign,
  GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Chatbot from './Chatbot';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  id: string;
  name: string;
  path?: string;
  icon: React.ReactNode;
  type?: 'resources';
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated, openModal } = useAuth();
  const { addToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Define if the current page is the Landing Page (Root)
  const isLandingPage = location.pathname === '/';


  const [resourcesOpen, setResourcesOpen] = React.useState(true);
  const [mainNavItems, setMainNavItems] = useState<NavItem[]>([
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'favorites', name: 'Favorites', path: '/favorites', icon: <Star size={20} /> },
    { id: 'shipments', name: 'Shipments', path: '/shipments', icon: <Package size={20} /> },
    { id: 'routes', name: 'Routes', path: '/routes', icon: <Map size={20} /> },
    { id: 'billing', name: 'Billing', path: '/billing', icon: <FileText size={20} /> },
    { id: 'incidents', name: 'Incidents', path: '/incidents', icon: <AlertTriangle size={20} /> },
    { id: 'complaints', name: 'Complaints', path: '/complaints', icon: <MessageSquare size={20} /> },
    { id: 'resources-section', name: 'Resources', icon: <FolderOpen size={20} />, type: 'resources' },
  ]);

  // Save order to localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('navOrder');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        // Ensure all current items are included and in the saved order
        const orderedItems = parsedOrder
          .map((id: string) => mainNavItems.find(item => item.id === id))
          .filter(Boolean);

        // Add any new items that aren't in the saved order
        const newItems = mainNavItems.filter(
          item => !parsedOrder.includes(item.id)
        );

        setMainNavItems([...orderedItems, ...newItems]);
      } catch (e) {
        console.error('Failed to parse saved navigation order', e);
      }
    }
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(mainNavItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Save the new order to localStorage
    const order = items.map(item => item.id);
    localStorage.setItem('navOrder', JSON.stringify(order));

    setMainNavItems(items);
  };

  const [resourceItems, setResourceItems] = useState([
    { id: 'clients', name: 'Clients', path: '/clients', icon: <Users size={18} /> },
    { id: 'drivers', name: 'Drivers', path: '/drivers', icon: <User size={18} /> },
    { id: 'vehicles', name: 'Vehicles', path: '/fleet', icon: <Truck size={18} /> },
    { id: 'destinations', name: 'Destinations', path: '/destinations', icon: <MapPin size={18} /> },
    { id: 'service-types', name: 'Service Types', path: '/service-types', icon: <List size={18} /> },
    { id: 'pricing', name: 'Pricing', path: '/pricing', icon: <DollarSign size={18} /> },
  ]);

  // Save resource items order to localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('resourceNavOrder');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        const orderedItems = parsedOrder
          .map((id: string) => resourceItems.find(item => item.id === id))
          .filter(Boolean);

        const newItems = resourceItems.filter(
          item => !parsedOrder.includes(item.id)
        );

        setResourceItems([...orderedItems, ...newItems]);
      } catch (e) {
        console.error('Failed to parse saved resource navigation order', e);
      }
    }
  }, []);

  const onResourceDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(resourceItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Save the new order to localStorage
    const order = items.map(item => item.id);
    localStorage.setItem('resourceNavOrder', JSON.stringify(order));

    setResourceItems(items);
  };

  const handleNotificationClick = () => {
    addToast('info', 'You have no new notifications at this time.');
  };

  // --- LANDING PAGE LAYOUT ---
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-lime-400 selection:text-slate-900 flex flex-col">
        {/* Improved Header with better spacing and visual hierarchy */}
        <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
          <div className="container mx-auto px-6 h-20 flex justify-between items-center">
            {/* Logo Area */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-gradient-to-br from-lime-400 to-lime-600 p-2 rounded-xl shadow-lg shadow-lime-400/20 group-hover:shadow-lime-400/40 transition-all duration-300">
                <Zap className="text-slate-900 fill-slate-900" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display tracking-tight text-white leading-none">
                  Route<span className="text-lime-400">Mind</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium leading-none mt-1">
                  AI Logistics
                </span>
              </div>
            </div>

            {/* Desktop Nav - Centered with hover effects */}
            <nav className="hidden md:flex items-center space-x-1">
              {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Auth Button */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-lime-400 text-slate-900 rounded-lg font-bold hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 hover:-translate-y-0.5 text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={openModal} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                    Log In
                  </button>
                  <button
                    onClick={openModal}
                    className="px-6 py-2.5 bg-white/10 text-white border border-white/10 rounded-lg font-bold hover:bg-white/20 hover:border-white/20 transition-all text-sm backdrop-blur-sm"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950 z-40 pt-28 px-6 md:hidden animate-in slide-in-from-top-10">
            <nav className="flex flex-col space-y-6 text-center text-xl font-bold text-slate-300">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <button
                onClick={() => { openModal(); setMobileMenuOpen(false); }}
                className="text-lime-400 border border-lime-400/20 py-3 rounded-xl bg-lime-400/10 mt-4"
              >
                Log In / Sign Up
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 pt-20">
          {children}
        </main>

        <Chatbot />
      </div>
    );
  }

  // --- APP DASHBOARD LAYOUT ---
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden selection:bg-lime-400 selection:text-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 flex-shrink-0 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 z-20 transition-colors duration-300">
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
        <DragDropContext onDragEnd={onDragEnd}>
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
                                                      >
                                                        <div
                                                          {...resProvided.dragHandleProps}
                                                          className="p-1 -ml-1 mr-0.5 text-slate-400 hover:text-lime-500 cursor-grab active:cursor-grabbing"
                                                          aria-label="Drag to reorder"
                                                        >
                                                          <GripVertical size={14} />
                                                        </div>
                                                        <Link
                                                          to={resource.path}
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
                                to={item.path!}
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
                {mainNavItems.map(item => (
                  <Link
                    key={item.id}
                    to={item.path || '#'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resources</p>
                  {resourceItems.map(item => (
                    <Link
                      key={item.id}
                      to={item.path || '#'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
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

export default Layout;
