import type {
  User,
  UserResponse,
  UsersResponse,
  UserProfileResponse,
  UserStatsResponse,
} from "../types/user";

// Use relative path for proxy, but fallback to direct URL if needed
const API_BASE =  "/api";

class UserService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("auth_token");

    // Ensure we have the full URL
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Admin-only: Get all users
  async getAllUsers(): Promise<UsersResponse> {
    return this.request<UsersResponse>("/admin/users");
  }

  // Admin-only: Update user role
  async updateUserRole(userId: string, role: string): Promise<UserResponse> {
    return this.request<UserResponse>(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  // Admin-only: Get admin stats
  async getAdminStats(): Promise<UserStatsResponse> {
    return this.request<UserStatsResponse>("/admin/stats");
  }

  // Get current user profile
  async getCurrentUser(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>("/userprofile");
  }

  // Update current user display name
  async updateDisplayName(displayName: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/userprofile/displayname", {
      method: "PUT",
      body: JSON.stringify({ displayName }),
    });
  }

  // Auth endpoints
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    });
  }
}

export const userService = new UserService();
