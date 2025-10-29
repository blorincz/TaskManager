// src/hooks/useUserManagement.ts
import { useState, useEffect, useCallback } from "react";
import type { User, UserStatsResponse } from "../types/user";
import { userService } from "../services/userService";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize fetchUsers with useCallback
  const fetchUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers();
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize fetchStats with useCallback
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const response = await userService.getAdminStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const updateUserRole = async (
    userId: string,
    newRole: string
  ): Promise<boolean> => {
    try {
      await userService.updateUserRole(userId, newRole);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update user role"
      );
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]); // Now these are stable dependencies

  return {
    users,
    stats,
    loading,
    error,
    fetchUsers,
    updateUserRole,
  };
};
