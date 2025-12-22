import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';

/**
 * Props for the main Layout component
 */
interface LayoutProps {
  children: ReactNode; // The content to be rendered within the layout
}

/**
 * Main Layout Component.
 * 
 * Acts as a router/switcher to determine which layout structure to render
 * based on the current URL path.
 * 
 * - Renders LandingLayout for the root path ('/')
 * - Renders DashboardLayout for all other paths (app routes)
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Determine if the current view is the public landing page
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return <LandingLayout>{children}</LandingLayout>;
  }

  // Default to dashboard layout for all authenticated/app routes
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
