import React, { createContext, useContext, useState, useEffect } from 'react';
import { auditLog } from '../services/auditLog';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isModalOpen: boolean;
  token?: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  openModal: () => void;
  closeModal: () => void;
  hasRole: (role: string) => boolean;
  authorize: (roles: string[]) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));

  // Load user profile if token exists
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          // Verify token by fetching user profile
          const response = await apiClient.get(`${ENDPOINTS.USERS}me/`);
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to load user', error);
          logout();
        }
      } else {
        // If no user, prompt login after a short delay for effect (keeping original behavior)
        setTimeout(() => setIsModalOpen(true), 1000);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      // 1. Get Token using 'email' field in payload
      const loginResponse = await apiClient.post(ENDPOINTS.LOGIN, {
        email,
        password
      });

      const { access, refresh } = loginResponse.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setToken(access);

      // 2. Get User Details
      const userResponse = await apiClient.get(`${ENDPOINTS.USERS}me/`);
      const userData = userResponse.data;

      setUser(userData);
      setIsModalOpen(false);

      return true;
    } catch (error: any) {
      console.error('Login failed', error);
      alert(`Login Failed: ${error.response?.data?.detail || error.message}`);
      return false;
    }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      // Send Google credential to backend for verification
      const response = await apiClient.post(ENDPOINTS.GOOGLE_AUTH, {
        credential
      });

      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setToken(access);
      setUser(userData);
      setIsModalOpen(false);

      return true;
    } catch (error: any) {
      console.error('Google login failed', error);
      alert(`Google Login Failed: ${error.response?.data?.error || error.message}`);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // 1. Register User (using name as username for now)
      // Note: UserRegistrationSerializer expects 'username', 'email', 'password'.
      // UI has "name", "email", "password". We'll map name -> username.
      await apiClient.post(ENDPOINTS.REGISTER, {
        username: name,
        email,
        password,
        role: 'client' // Default role
      });

      // 2. Auto-login after registration
      return await login(email, password);
    } catch (error: any) {
      console.error('Registration failed', error);
      alert(`Registration Failed: ${JSON.stringify(error.response?.data || error.message)}`);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsModalOpen(true);
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    // Assuming backend returns lower case or mapped roles. 
    // Adapting to frontend expected 'Admin' vs backend 'admin' if needed.
    const userRole = user.role.toLowerCase();
    const targetRole = role.toLowerCase();
    return userRole === targetRole || userRole === 'admin';
  };

  const authorize = (roles: string[]) => {
    if (!user) return false;
    if (user.role.toLowerCase() === 'admin') return true;
    return roles.map(r => r.toLowerCase()).includes(user.role.toLowerCase());
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      console.log('Updating profile with:', updates);
      const response = await apiClient.patch(`${ENDPOINTS.USERS}me/`, updates);
      console.log('Profile update response:', response.data);
      setUser(response.data);
      return true;
    } catch (error: any) {
      console.error('Profile update failed', error);
      console.error('Error response:', error.response?.data);
      alert(`Profile update failed: ${JSON.stringify(error.response?.data || error.message)}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isModalOpen,
      token,
      login,
      loginWithGoogle,
      register,
      logout,
      openModal,
      closeModal,
      hasRole,
      authorize,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};