import { useEffect, useCallback } from "react";
import { useUserManagement } from "../hooks/useUserManagement";
import { UserTable } from "./UserTable";
import { useAuth } from "../hooks/useAuth";

export const AdminDashboard: React.FC = () => {
  const { users, stats, loading, error, fetchUsers, updateUserRole } =
    useUserManagement();
  const { user: currentUser } = useAuth();

  // Memoize the refresh function
  const refreshData = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]); // refreshData is now stable

  if (loading && users.length === 0) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchUsers} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>User Management</h1>
        <div className="admin-info">
          Logged in as: <strong>{currentUser?.displayName}</strong> (
          {currentUser?.email})
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-number">{users.length}</div>
          </div>
          <div className="stat-card">
            <h3>Admins</h3>
            <div className="stat-number">
              {users.filter((u) => u.role === "Admin").length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Managers</h3>
            <div className="stat-number">
              {users.filter((u) => u.role === "Manager").length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Regular Users</h3>
            <div className="stat-number">
              {users.filter((u) => u.role === "User").length}
            </div>
          </div>
        </div>
      )}

      <div className="users-section">
        <div className="section-header">
          <h2>All Users ({users.length})</h2>
          <button
            onClick={fetchUsers}
            className="refresh-button"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <UserTable users={users} onRoleUpdate={updateUserRole} />
      </div>
    </div>
  );
};
