import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInUser, signUpUser, fetchCurrentUser } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'waterpoint_jwt_token';
const USER_KEY = 'waterpoint_user_profile';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    let mounted = true;
    async function verifySession() {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        try {
          const profile = await fetchCurrentUser(savedToken);
          if (profile && mounted) {
            setUser(profile);
            localStorage.setItem(USER_KEY, JSON.stringify(profile));
          } else if (mounted) {
            // Invalid/expired token
            logout();
          }
        } catch {
          // Keep offline state if available or gracefully handle
        }
      }
      if (mounted) setLoading(false);
    }
    verifySession();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    const res = await signInUser({ email, password });
    if (res.access_token && res.user) {
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  };

  const signup = async (signupData) => {
    const res = await signUpUser(signupData);
    if (res.access_token && res.user) {
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
