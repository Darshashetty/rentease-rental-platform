/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Configure axios instance
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? 'https://rentease-rental-platform.onrender.com/api'
      : 'http://localhost:5000/api'),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser || storedUser === 'undefined' || storedUser === 'null') return null;
      return JSON.parse(storedUser);
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    const storedToken = localStorage.getItem('token');
    if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
      localStorage.removeItem('token');
      return null;
    }
    // Set Authorization header immediately if token exists
    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
    return storedToken;
  });
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  // Add token to axios requests (fallback for state changes)
  useEffect(() => {
    if (token && token !== 'undefined' && token !== 'null') {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', { email, password });
      
      const { token, user } = data;
      setToken(token);
      setUser(user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message, { cause: err });
    }
  }, []);

  const register = useCallback(async (name, email, password, role = 'tenant') => {
    try {
      setError(null);
      const { data } = await api.post('/auth/register', { name, email, password, role });
      
      const { token, user } = data;
      setToken(token);
      setUser(user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message, { cause: err });
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to send reset email', { cause: err });
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to reset password', { cause: err });
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const { data } = await api.put('/auth/update-profile', profileData);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update profile', { cause: err });
    }
  }, []);

  const isAuthenticated = !!token;
  const isOwner = user?.role === 'owner';
  const isTenant = user?.role === 'tenant';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isOwner,
    isTenant,
    isAdmin,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
