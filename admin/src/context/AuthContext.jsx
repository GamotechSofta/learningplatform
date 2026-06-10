import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

const ALLOWED_ROLES = ["admin", "instructor"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Cookie may already be cleared
    }
    setUser(null);
  };

  const login = async (email, password) => {
    const result = await authService.login(email, password);

    if (!ALLOWED_ROLES.includes(result.role)) {
      await logout();
      throw new Error("Only admin or instructor accounts can access this panel");
    }

    setUser(result);
    return result;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const me = await authService.getMe();
        if (!ALLOWED_ROLES.includes(me.role)) {
          await logout();
        } else {
          setUser(me);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
