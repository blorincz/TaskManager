import { useState } from "react";
import type { User } from "../types/user";

interface UserTableProps {
  users: User[];
  onRoleUpdate: (userId: string, newRole: string) => Promise<boolean>;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onRoleUpdate,
}) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    const success = await onRoleUpdate(userId, newRole);
    setUpdatingUserId(null);

    if (success) {
      // Optional: Show success message
      console.log("User role updated successfully");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (users.length === 0) {
    return <div className="no-users">No users found.</div>;
  }

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>Display Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="user-row">
              <td className="user-display-name">{user.displayName}</td>
              <td className="user-email">{user.email}</td>
              <td className="user-role">
                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </td>
              <td className="user-joined">{formatDate(user.createdAt)}</td>
              <td className="user-actions">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingUserId === user.id}
                  className="role-select"
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
                {updatingUserId === user.id && (
                  <span className="updating-spinner">Updating...</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
