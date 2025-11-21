// src/components/UserProfile.tsx
import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import type { UserProfileResponse } from "../types/user";

export const UserProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const profileData = await userService.getCurrentUser();
        setProfile(profileData);
        setDisplayName(profileData.displayName || user?.displayName || "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [user?.displayName]);

  const handleUpdateDisplayName = async (): Promise<void> => {
    setLoading(true);
    try {
      await userService.updateDisplayName(displayName);
      setIsEditing(false);
      // Update local user data
      const updatedUser = user ? { ...user, displayName } : null;
      if (updatedUser) {
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
      }
      window.location.reload(); // Simple way to refresh user context
    } catch (error) {
      console.error("Failed to update display name:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-field">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>

        <div className="profile-field">
          <label>Display Name:</label>
          {isEditing ? (
            <div className="edit-field">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="name-input"
              />
              <button
                onClick={handleUpdateDisplayName}
                disabled={loading}
                className="save-button"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDisplayName(user.displayName);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="display-field">
              <span>{user.displayName}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="edit-button"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="profile-field">
          <label>Role:</label>
          <span className={`role-badge role-${user.role.toLowerCase()}`}>
            {user.role}
          </span>
        </div>

        <div className="profile-field">
          <label>User ID:</label>
          <span className="user-id">{user.id}</span>
        </div>
      </div>

      {profile && (
        <div className="profile-details">
          <h3>Profile Details</h3>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
