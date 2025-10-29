export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

export interface UserStats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  recentRegistrations: number;
}

// Response types for API calls
export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  message: string;
  user: User;
}

export interface UserProfileResponse {
  userId?: string;
  userEmail?: string;
  userName?: string;
  isAuthenticated?: boolean;
  authenticationType?: string;
  message?: string;
  email?: string;
  displayName?: string;
  role?: string;
}

export interface UserStatsResponse {
  message: string;
  totalUsers?: number;
  usersByRole?: Record<string, number>;
  recentRegistrations?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
