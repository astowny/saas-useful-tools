import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [whiteLabelConfig, setWhiteLabelConfig] = useState(null);

  const applyWhiteLabel = useCallback((config) => {
    if (!config) {
      document.documentElement.style.removeProperty('--wl-primary');
      document.documentElement.style.removeProperty('--wl-accent');
      return;
    }
    if (config.primary_color) {
      document.documentElement.style.setProperty('--wl-primary', config.primary_color);
    }
    if (config.accent_color) {
      document.documentElement.style.setProperty('--wl-accent', config.accent_color);
    }
  }, []);

  const loadWhiteLabel = useCallback(async (currentToken) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/enterprise/white-label`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWhiteLabelConfig(data.config);
        applyWhiteLabel(data.config);
      }
    } catch (err) {
      // white-label config not critical, fail silently
    }
  }, [applyWhiteLabel]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setWhiteLabelConfig(null);
    applyWhiteLabel(null);
    localStorage.removeItem('token');
  }, [applyWhiteLabel]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user && data.user.plan_name === 'enterprise') {
          await loadWhiteLabel(token);
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout, loadWhiteLabel]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur de connexion');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    if (data.user && data.user.plan_name === 'enterprise') {
      await loadWhiteLabel(data.token);
    }
    return data;
  };

  const register = async (email, password, fullName) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, fullName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Erreur lors de l'inscription");
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data;
  };

  const refreshWhiteLabel = useCallback(async () => {
    if (token) {
      await loadWhiteLabel(token);
    }
  }, [token, loadWhiteLabel]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    whiteLabelConfig,
    refreshWhiteLabel,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

