import { createContext, useMemo, useState } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const value = useMemo(
    () => ({
      isLoading,
      setIsLoading,
    }),
    [isLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
