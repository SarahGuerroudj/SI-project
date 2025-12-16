import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Shipments from './components/Shipments';
import RoutesComponent from './components/Routes';
import Billing from './components/Billing';
import Incidents from './components/Incidents';
import Complaints from './components/Complaints';
import ClientDetails from './components/ClientDetails';
import ClientsPage from './components/clients/ClientsPage';
import DriversPage from './components/drivers/DriversPage';
import ResourcesPage from './components/ResourcesPage';
import FleetPage from './components/vehicles/FleetPage';
import DestinationsPage from './components/DestinationsPage';
import ServiceTypesPage from './components/ServiceTypesPage';
import PricingPage from './components/PricingPage';
import Settings from './components/Settings';
import Account from './components/Account';
import FavoritesPage from './components/FavoritesPage';
import Notifications from './components/Notifications';
import AuthModal from './components/AuthModal';
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

import ErrorBoundary from './components/ErrorBoundary';

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
                          <Route path="/dashboard" element={<Dashboard />} />
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
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/account" element={<Account />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          <Route path="/notifications" element={<Notifications />} />

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
