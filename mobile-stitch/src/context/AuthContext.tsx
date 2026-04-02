import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  profileImageUri: string | null;
  signIn: () => void;
  signOut: () => void;
  setProfileImageUri: (uri: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(true);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  const signIn = useCallback(() => setAuthenticated(true), []);
  const signOut = useCallback(() => {
    setAuthenticated(false);
    setProfileImageUri(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, profileImageUri, signIn, signOut, setProfileImageUri }),
    [isAuthenticated, profileImageUri, signIn, signOut, setProfileImageUri]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
