import React, { useState, useEffect } from "react";
import {
  testConnection,
  logAuditEvent,
  updateUserProfile,
  fetchSheetData,
} from "../services/unifiedGoogleSheetsService";
import Loading from "./Common/Loading";
import "./EnhancedUserProfile.css";

const EnhancedUserProfile = ({ userId, onProfileUpdate }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    avatar: "",
    preferences: {
      notifications: true,
      darkMode: false,
      language: "vi",
    },
  });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [auditLogs, setAuditLogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkConnection();
    loadProfile();
  }, [userId]);

  const checkConnection = async () => {
    try {
      const result = await testConnection();
      setConnectionStatus(result.success ? "connected" : "error");
    } catch (error) {
      console.error("Connection check failed:", error);
      setConnectionStatus("error");
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Load profile from Google Sheets
      const result = await fetchSheetData("UserProfiles");
      if (result && result.data) {
        const userProfile = result.data.find((user) => user.id === userId);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateUserProfile(userId, profile);

      if (result.success) {
        await logAuditEvent({
          event: "Profile Updated",
          user: userId,
          details: `Profile updated successfully`,
          status: "Success",
        });

        setIsEditing(false);
        if (onProfileUpdate) {
          onProfileUpdate(profile);
        }
      } else {
        await logAuditEvent({
          event: "Profile Update Failed",
          user: userId,
          details: result.error,
          status: "Error",
        });
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      await logAuditEvent({
        event: "Profile Update Failed",
        user: userId,
        details: error.message,
        status: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (pref, value) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: value,
      },
    }));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="enhanced-user-profile">
      <div className="profile-header">
        <h2>👤 User Profile Management</h2>
        <div className={`connection-status ${connectionStatus}`}>
          <span className="status-dot"></span>
          {connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "checking"
              ? "Checking..."
              : "Connection Error"}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={profile.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                disabled={!isEditing}
              >
                <option value="">Select Role</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                disabled={!isEditing}
                placeholder="Enter department"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Preferences</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={profile.preferences.notifications}
                  onChange={(e) =>
                    handlePreferenceChange("notifications", e.target.checked)
                  }
                  disabled={!isEditing}
                />
                Email Notifications
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={profile.preferences.darkMode}
                  onChange={(e) =>
                    handlePreferenceChange("darkMode", e.target.checked)
                  }
                  disabled={!isEditing}
                />
                Dark Mode
              </label>
            </div>

            <div className="preference-item">
              <label>
                Language:
                <select
                  value={profile.preferences.language}
                  onChange={(e) =>
                    handlePreferenceChange("language", e.target.value)
                  }
                  disabled={!isEditing}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button
                className="btn-success"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                💾 Save Changes
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  loadProfile(); // Reload original data
                }}
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="audit-section">
        <h3>Recent Activity</h3>
        <div className="audit-logs">
          {auditLogs.length > 0 ? (
            auditLogs.map((log, index) => (
              <div key={index} className="audit-log-item">
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="log-event">{log.event}</span>
                <span className={`log-status ${log.status.toLowerCase()}`}>
                  {log.status}
                </span>
              </div>
            ))
          ) : (
            <p className="no-logs">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserProfile;
