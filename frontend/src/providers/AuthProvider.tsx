import { useState, useEffect, type ReactNode } from "react";
import {
  AuthContext,
  type AuthContextType,
  type User,
} from "../contexts/AuthContext";
import { userService } from "../services/userService";

// Auth Provider Component Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component (only exports this component)
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on app start
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (token && userData) {
        try {
          // Verify token is still valid by making a test request
          await userService.getCurrentUser();
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await userService.login(email, password);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    const data = await userService.register(email, password, displayName);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = (): void => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
