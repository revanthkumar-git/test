import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authApi, getStoredToken, setStoredToken, clearStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    university?: string;
    major?: string;
    semester?: string;
    studyGoal?: string;
  }) => Promise<void>;
  updateProfile: (data: {
    name?: string;
    university?: string | null;
    major?: string | null;
    semester?: string | null;
    studyGoal?: string | null;
    avatarColor?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      setUser(response.user);
      setToken(currentToken);
    } catch (error) {
      console.warn('Failed to verify token:', error);
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('studyflow:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('studyflow:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    university?: string;
    major?: string;
    semester?: string;
    studyGoal?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    university?: string | null;
    major?: string | null;
    semester?: string | null;
    studyGoal?: string | null;
    avatarColor?: string;
  }) => {
    const res = await authApi.updateProfile(data);
    setUser(res.user);
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};