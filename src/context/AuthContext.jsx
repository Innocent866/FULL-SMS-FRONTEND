import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient.js';

const AuthContext = createContext({ user: null });
const ACCESS_TOKEN_KEY = 'smsAccessToken';

const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      try {
        const storedToken = getStoredToken();
        if (storedToken) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        }
        const { data } = await apiClient.get('/auth/me');
        if (isMounted) setUser(data.data);
      } catch (error) {
        if (import.meta.env.DEV) console.info('No session on load');
        // setAuthToken(null);
        console.log(`${error}`);
        
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((authUser, token) => {
    if (token) setAuthToken(token);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, setUser, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
