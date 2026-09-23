import { createContext, useMemo, useState } from 'react';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
    }),
    [profile]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
