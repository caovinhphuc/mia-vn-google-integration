import React, { useState } from "react";
import { updateUserProfileEnhanced } from "../services/googleAppsScriptService";
import "./QuickEditModal.css";

const QuickEditModal = ({
  isOpen,
  onClose,
  userData,
  onSave,
  title = "Quick Edit",
}) => {
  const [formData, setFormData] = useState(userData || {});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (isOpen && userData) {
      setFormData(userData);
      setErrors({});
    }
  }, [isOpen, userData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.role?.trim()) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfileEnhanced(formData.id, formData);

      if (result.success) {
        if (onSave) {
          onSave(formData);
        }
        onClose();
      } else {
        setErrors({ general: result.error || "Failed to save changes" });
      }
    } catch (error) {
      console.error("Save error:", error);
      setErrors({ general: error.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData || {});
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="quick-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {errors.general && (
            <div className="error-message">⚠️ {errors.general}</div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "error" : ""}
                placeholder="Enter full name"
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "error" : ""}
                placeholder="Enter email address"
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">
                Role <span className="required">*</span>
              </label>
              <select
                id="role"
                value={formData.role || ""}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className={errors.role ? "error" : ""}
              >
                <option value="">Select Role</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </select>
              {errors.role && (
                <span className="field-error">{errors.role}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                value={formData.department || ""}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                placeholder="Enter department"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status || "active"}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              <>💾 Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickEditModal;
