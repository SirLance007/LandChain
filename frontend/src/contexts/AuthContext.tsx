import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture: string;
  walletAddress?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  updateWalletAddress: (address: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const getApiUrl = () => {
  let url = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getApiUrl();

// Configure axios to include credentials
axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  const checkAuth = async (): Promise<void> => {
    if (authChecked) return; // Prevent multiple calls

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/user`);

      if (response.data.success) {
        setUser(response.data.user);
        console.log('✅ User authenticated:', response.data.user.name);
      }
    } catch (error: any) {
      // User not authenticated - this is normal
      console.log('ℹ️ User not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = (): void => {
    // Redirect to Google OAuth
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      setUser(null);
      toast.success('Logged out successfully');

      // Redirect to landing page
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const updateWalletAddress = async (address: string): Promise<boolean> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/wallet`, {
        walletAddress: address
      });

      if (response.data.success) {
        setUser(prev => prev ? { ...prev, walletAddress: address } : null);
        toast.success('Wallet address updated successfully');
        return true;
      } else {
        toast.error('Failed to update wallet address');
        return false;
      }
    } catch (error: any) {
      console.error('Update wallet error:', error);
      toast.error(error.response?.data?.error || 'Failed to update wallet address');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateWalletAddress,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};