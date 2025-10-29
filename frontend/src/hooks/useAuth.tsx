import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Re-export the User type for convenience
export type { User, AuthContextType } from "../contexts/AuthContext";
