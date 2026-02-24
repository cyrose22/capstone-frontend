import React, { useState } from "react";
import axios from "axios";

function ProfileTab({ user, setUser }) {
  const [newContact, setNewContact] = useState(user?.contact || "");
  const [updatingContact, setUpdatingContact] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleContactSave = async () => {
    if (!newContact.trim()) return alert("📵 Contact can't be empty");
    try {
      setUpdatingContact(true);
      await axios.put(`https://capstone-backend-kiax.onrender.com/users/${user.id}/contact`, {
        contact: newContact,
      });
      const updatedUser = { ...user, contact: newContact };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("📞 Contact updated successfully!");
    } catch {
      alert("❌ Failed to update contact.");
    } finally {
      setUpdatingContact(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!newPassword.trim()) return alert("Password can't be empty");
    try {
      setSavingPassword(true);
      await axios.put(`https://capstone-backend-kiax.onrender.com/users/${user.id}/password`, {
        password: newPassword,
      });
      alert("✅ Password updated!");
      setEditingPassword(false);
      setNewPassword("");
    } catch {
      alert("❌ Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: "520px",
        margin: "1rem auto",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>👤 Account Details</h2>

      {/* Full Name */}
      <div style={{ marginBottom: "1.2rem" }}>
        <label>
          <strong>🪪 Full Name</strong>
        </label>
        <input
          type="text"
          value={user?.fullname || ""}
          disabled
          style={{
            width: "100%",
            padding: "0.6rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginTop: "0.35rem",
            backgroundColor: "#f9f9f9",
          }}
        />
      </div>

      {/* Username */}
      <div style={{ marginBottom: "1.2rem" }}>
        <label>
          <strong>👤 Username</strong>
        </label>
        <input
          type="text"
          value={user?.username || ""}
          disabled
          style={{
            width: "100%",
            padding: "0.6rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginTop: "0.35rem",
            backgroundColor: "#f9f9f9",
          }}
        />
      </div>

      {/* Contact Number */}
      <div style={{ marginBottom: "1.2rem" }}>
        <label>
          <strong>📞 Contact #</strong>
        </label>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginTop: "0.35rem",
          }}
        >
          <input
            type="text"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            style={{
              flex: 1,
              padding: "0.6rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <button
            onClick={handleContactSave}
            disabled={updatingContact}
            style={{
              padding: "0.5rem 0.9rem",
              fontSize: "0.9rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: updatingContact ? "#bbb" : "#4CAF50",
              color: "#fff",
              cursor: updatingContact ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {updatingContact ? "..." : "💾"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div style={{ marginBottom: "1.2rem" }}>
        <label>
          <strong>🔐 Password</strong>
        </label>
        <div style={{ marginTop: "0.35rem" }}>
          <button
            onClick={() => setEditingPassword(true)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2196F3",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {editingPassword && (
        <div
          onClick={() => setEditingPassword(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "1.8rem",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "420px",
              position: "relative",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            }}
          >
            <button
              onClick={() => setEditingPassword(false)}
              style={{
                position: "absolute",
                top: "0.8rem",
                right: "0.8rem",
                background: "none",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </button>
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ margin: 0 }}>🔐 Update Password</h2>
              <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.3rem 0" }}>
                Keep your account secure by using a strong password.
              </p>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "0.9rem",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label htmlFor="showPassword" style={{ fontSize: "0.9rem" }}>
                Show Password
              </label>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.6rem",
              }}
            >
              <button
                onClick={() => setEditingPassword(false)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#ccc",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                ❌ Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={savingPassword}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: savingPassword ? "#bbb" : "#4CAF50",
                  color: "#fff",
                  cursor: savingPassword ? "not-allowed" : "pointer",
                  fontWeight: "600",
                }}
              >
                {savingPassword ? "Saving..." : "💾 Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileTab;
