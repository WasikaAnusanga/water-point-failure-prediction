import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInUser, signUpUser, signOutUser, fetchCurrentUser } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'waterpoint_jwt_token';
const USER_KEY = 'waterpoint_user_profile';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh user profile from backend GET /auth/me using HttpOnly cookie or token
  const refreshUser = useCallback(async () => {
    try {
      const profile = await fetchCurrentUser();
      if (profile) {
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        return profile;
      } else {
        setUser(null);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
    } catch (err) {
      setUser(null);
      return null;
    }
  }, []);

  // Determine whether the user currently has a valid session on startup
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const profile = await fetchCurrentUser();
        if (isMounted) {
          if (profile) {
            setUser(profile);
            localStorage.setItem(USER_KEY, JSON.stringify(profile));
          } else {
            setUser(null);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await signInUser({ email, password });
    if (res.access_token) {
      localStorage.setItem(TOKEN_KEY, res.access_token);
    }
    if (res.user) {
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  };

  const signup = async ({ name, email, password }) => {
    const res = await signUpUser({ name, email, password });
    if (res.access_token) {
      localStorage.setItem(TOKEN_KEY, res.access_token);
    }
    if (res.user) {
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      await signOutUser();
    } finally {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        refreshUser
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
