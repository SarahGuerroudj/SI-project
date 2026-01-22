import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import DashboardRouter from './components/layout/DashboardRouter';
import Shipments from './pages/Shipments';
import RoutesComponent from './pages/Routes';
import Billing from './pages/Billing';
import Incidents from './pages/Incidents';
import Complaints from './pages/Complaints';
import ClientDetails from './pages/ClientDetails';
import ClientsPage from './features/clients/ClientsPage';
import DriversPage from './features/drivers/DriversPage';
import ResourcesPage from './pages/ResourcesPage';
import FleetPage from './features/vehicles/FleetPage';
import DestinationsPage from './pages/DestinationsPage';
import ServiceTypesPage from './pages/ServiceTypesPage';
import PricingPage from './pages/PricingPage';
import Settings from './pages/Settings';
import Account from './pages/Account';
import FavoritesPage from './pages/FavoritesPage';
import Notifications from './components/ui/Notifications';
import Unauthorized from './pages/Unauthorized';
import AuditLogs from './features/admin/AuditLogs';
import AuthModal from './components/ui/AuthModal';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { DataProvider } from './contexts/DataContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '490153297375-nr0jsbknki9nqou59b9smv8nrdahoi7k.apps.googleusercontent.com';

// Create a client
const queryClient = new QueryClient();

import ErrorBoundary from './components/ui/ErrorBoundary';

// ...

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider>
            <ToastProvider>
              <DataProvider>
                <FavoritesProvider>
                  <AuthProvider>
                    <HashRouter>
                      <Layout>
                        <Routes>
                          {/* Home/Landing Page at root */}
                          <Route path="/" element={<Home />} />

                          {/* App Routes */}
                          <Route path="/dashboard" element={<DashboardRouter />} />
                          <Route path="/shipments" element={<Shipments />} />
                          <Route path="/clients/:id" element={<ClientDetails />} />
                          <Route path="/routes" element={<RoutesComponent />} />
                          <Route path="/billing" element={<Billing />} />
                          <Route path="/incidents" element={<Incidents />} />
                          <Route path="/complaints" element={<Complaints />} />
                          <Route path="/clients" element={<ClientsPage />} />
                          <Route path="/drivers" element={<DriversPage />} />
                          <Route path="/destinations" element={<DestinationsPage />} />
                          <Route path="/pricing" element={<PricingPage />} />
                          <Route path="/service-types" element={<ServiceTypesPage />} />
                          <Route path="/resources" element={<ResourcesPage />} />
                          <Route path="/fleet" element={<FleetPage />} />
                          <Route path="/audit-logs" element={<AuditLogs />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/account" element={<Account />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/unauthorized" element={<Unauthorized />} />

                          {/* Fallback */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Layout>
                      <AuthModal />
                    </HashRouter>
                  </AuthProvider>
                </FavoritesProvider>
              </DataProvider>
            </ToastProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
