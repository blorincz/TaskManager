import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create Auth Context (no JSX here)
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
