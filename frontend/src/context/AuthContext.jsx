import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, getToken, setToken as persistToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await getMe();
      setUser(user);
    } catch {
      persistToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback((token, user) => {
    persistToken(token);
    setUser(user);
  }, []);

  const signOut = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}