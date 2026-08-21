import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'dermaura_user';
const TOKEN_STORAGE_KEY = 'dermaura_token';
const DOCTOR_DUTY_KEY = 'dermaura_doctor_duty_status';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and restore auth session on mount / page reload
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);

        // Strict Check: User is ONLY considered authenticated if BOTH stored token AND user exist
        if (storedToken && storedUserJson) {
          const parsedUser = JSON.parse(storedUserJson);
          if (parsedUser && (parsedUser.id || parsedUser._id || parsedUser.email)) {
            setUser(parsedUser);
            setRole(parsedUser.role ? parsedUser.role.toLowerCase() : 'patient');
            setToken(storedToken);
            setIsLoading(false);
            return;
          }
        }

        // Otherwise ensure a clean unauthenticated state
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setToken(null);
        setRole(null);
      } catch (err) {
        console.error('Failed to parse stored authentication session:', err);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setToken(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = (userData, jwtToken = null) => {
    if (!userData) return;
    
    const userRole = userData.role ? userData.role.toLowerCase() : 'patient';
    const activeToken = jwtToken || 'demo-jwt-session-token';

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_STORAGE_KEY, activeToken);

      if (userRole === 'doctor') {
        localStorage.setItem(DOCTOR_DUTY_KEY, 'online');
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('dermaura_duty_status_changed', { detail: 'online' }));
      }
    } catch (err) {
      console.error('Error persisting auth session to localStorage:', err);
    }

    setUser(userData);
    setToken(activeToken);
    setRole(userRole);
  };

  // Logout handler
  const logout = () => {
    try {
      if (role === 'doctor') {
        localStorage.setItem(DOCTOR_DUTY_KEY, 'offline');
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('dermaura_duty_status_changed', { detail: 'offline' }));
      }
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing auth session:', err);
    }

    setUser(null);
    setToken(null);
    setRole(null);
  };

  // Update user profile handler
  const updateUser = (updatedUserData) => {
    setUser((prevUser) => {
      const merged = { ...prevUser, ...updatedUserData };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.error('Error updating user in localStorage:', err);
      }
      return merged;
    });
  };

  const value = {
    user,
    token,
    role,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
