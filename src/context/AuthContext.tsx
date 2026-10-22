import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  wishlist: string[];
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  loginAsDemoUser: () => Promise<boolean>;
  loginAsDemoAdmin: () => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('novacart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('novacart_user');
      const storedToken = localStorage.getItem('novacart_token');
      if (storedUser && storedToken) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        if (Array.isArray(parsedUser.wishlist)) {
          setWishlist(parsedUser.wishlist);
          localStorage.setItem('novacart_wishlist', JSON.stringify(parsedUser.wishlist));
        }
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

  const syncWishlistStorage = (newWishlist: string[], currentUser: User | null) => {
    setWishlist(newWishlist);
    try {
      localStorage.setItem('novacart_wishlist', JSON.stringify(newWishlist));
      if (currentUser) {
        const updatedUser: User = { ...currentUser, wishlist: newWishlist };
        setUser(updatedUser);
        localStorage.setItem('novacart_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to update wishlist in localStorage:', err);
    }
  };

  const toggleWishlist = async (productId: string): Promise<void> => {
    const isPresent = wishlist.includes(productId);
    const updated = isPresent
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    syncWishlistStorage(updated, user);

    // If logged in, also sync with backend REST API
    if (user?.token) {
      try {
        await api.toggleWishlist(productId);
      } catch (err) {
        console.warn('Backend wishlist sync failed, retained in local storage:', err);
      }
    }
  };

  const addToWishlist = async (productId: string): Promise<void> => {
    if (!wishlist.includes(productId)) {
      await toggleWishlist(productId);
    }
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (wishlist.includes(productId)) {
      await toggleWishlist(productId);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  const clearWishlist = () => {
    syncWishlistStorage([], user);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.login(email, password);
      setUser(userData);
      const userWishlist = Array.isArray(userData.wishlist) ? userData.wishlist : wishlist;
      userData.wishlist = userWishlist;
      setWishlist(userWishlist);
      localStorage.setItem('novacart_wishlist', JSON.stringify(userWishlist));
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
      const userWishlist = Array.isArray(userData.wishlist) ? userData.wishlist : wishlist;
      userData.wishlist = userWishlist;
      setWishlist(userWishlist);
      localStorage.setItem('novacart_wishlist', JSON.stringify(userWishlist));
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
    // Note: We preserve local wishlist so guest items aren't abruptly destroyed, but can optionally reset
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
        wishlist,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        loginAsDemoUser,
        loginAsDemoAdmin,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
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
