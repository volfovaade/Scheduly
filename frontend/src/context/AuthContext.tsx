import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, userId: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component.
 * Manages user login state and provides auth context to the app.
 * Handles token-based authentication with session storage.
 *
 * @param children - Components to wrap with auth provider
 * @returns Provider component with auth context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Logs in a user by storing their token and fetching their profile.
   *
   * @param token - Authentication token from backend
   * @param userId - User ID from backend
   */
  const login = async (token: string, userId: string) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("userId", userId);
    try {
      const res = await axios.get(`/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user info", err);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      if (token && userId) {
        try {
          const res = await axios.get(`/users/${userId}`);
          setUser(res.data);
        } catch (err) {
          console.error("Silent login failed", err);
          sessionStorage.clear();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const isAdmin = user?.role === "Admin";

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isAdmin, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 *
 * @returns Auth context with user, login, logout functions
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}