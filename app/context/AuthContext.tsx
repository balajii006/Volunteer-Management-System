import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loginApi, refreshTokenApi, type User, type AuthTokens } from "~/services/auth";

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage on mount
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    try {
      const storedUser = localStorage.getItem("user");
      const storedTokens = localStorage.getItem("tokens");
      if (storedUser && storedTokens) {
        setUser(JSON.parse(storedUser));
        setTokens(JSON.parse(storedTokens));
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("tokens");
      localStorage.removeItem("token");
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setUser(res.user);
    setTokens(res.tokens);
    localStorage.setItem("user", JSON.stringify(res.user));
    localStorage.setItem("tokens", JSON.stringify(res.tokens));
    // Keep "token" key for the api interceptor
    localStorage.setItem("token", res.tokens.accessToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("user");
    localStorage.removeItem("tokens");
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!tokens?.accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
