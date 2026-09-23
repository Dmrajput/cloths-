import { useMemo, useState, createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/**
 * Phase 1: temporary development flag shows MainNavigator.
 * Phase 2 will replace this with real authentication.
 */
const DEV_SHOW_MAIN_APP = true;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_SHOW_MAIN_APP);
  const [user, setUser] = useState(null);

  const login = async () => {
    // Phase 2: real auth
    setIsAuthenticated(true);
    return Promise.resolve({ success: true });
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    return Promise.resolve({ success: true });
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
      setIsAuthenticated,
      setUser,
    }),
    [isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
