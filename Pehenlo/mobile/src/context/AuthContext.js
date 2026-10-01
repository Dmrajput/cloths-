import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createContext } from 'react';
import { authService } from '../services/authService';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import { clearAccessToken, readAccessToken, saveAccessToken } from '../services/tokenStorage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  const clearSession = useCallback(async () => {
    await clearAccessToken();
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshLock = useRef(null);

  const refreshSession = useCallback(async () => {
    if (refreshLock.current) {
      return refreshLock.current;
    }

    refreshLock.current = (async () => {
      setIsLoading(true);
      setSessionError(null);

      try {
        const storedToken = await readAccessToken();
        if (!storedToken) {
          await clearSession();
          return;
        }

        setAuthToken(storedToken);
        setToken(storedToken);
        const response = await authService.getCurrentUser();
        setUser(response?.data?.user || null);
        setIsAuthenticated(Boolean(response?.data?.user));
      } catch (error) {
        if (error?.code === 'NETWORK_ERROR') {
          setSessionError(error);
          return;
        }
        await clearSession();
      } finally {
        setIsLoading(false);
      }
    })().finally(() => {
      refreshLock.current = null;
    });

    return refreshLock.current;
  }, [clearSession]);

  const establishSession = useCallback(async (nextToken, nextUser) => {
    await saveAccessToken(nextToken);
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setIsAuthenticated(true);
    setSessionError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (_error) {
      // Client token removal is the source of truth for stateless JWT logout.
    }
    await clearSession();
  }, [clearSession, token]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      sessionError,
      login: establishSession,
      logout,
      refreshSession,
      setUser,
    }),
    [user, token, isAuthenticated, isLoading, sessionError, establishSession, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
