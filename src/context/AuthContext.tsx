import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  loginAsDemoUser: () => Promise<boolean>;
  loginAsDemoAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('novacart_user');
      const storedToken = localStorage.getItem('novacart_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load user session from localStorage', err);
      localStorage.removeItem('novacart_user');
      localStorage.removeItem('novacart_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.login(email, password);
      setUser(userData);
      localStorage.setItem('novacart_user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('novacart_token', userData.token);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.register(name, email, password);
      setUser(userData);
      localStorage.setItem('novacart_user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('novacart_token', userData.token);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('novacart_user');
    localStorage.removeItem('novacart_token');
  };

  const loginAsDemoUser = async (): Promise<boolean> => {
    return login('demo@example.com', 'user123');
  };

  const loginAsDemoAdmin = async (): Promise<boolean> => {
    return login('admin@novacart.com', 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        loginAsDemoUser,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
