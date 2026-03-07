import React, { useMemo, useState } from "react";
import axios from "axios";

function ProfileTab({ user, setUser }) {
  const [newContact, setNewContact] = useState(user?.contact || "");
  const [updatingContact, setUpdatingContact] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = useMemo(() => {
    const name = user?.fullname || "User";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const handleContactSave = async () => {
    if (!newContact.trim()) return alert("📵 Contact can't be empty");

    try {
      setUpdatingContact(true);

      await axios.put(
        `https://capstone-backend-kiax.onrender.com/users/${user.id}/contact`,
        { contact: newContact }
      );

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

      await axios.put(
        `https://capstone-backend-kiax.onrender.com/users/${user.id}/password`,
        { password: newPassword }
      );

      alert("✅ Password updated!");
      setEditingPassword(false);
      setNewPassword("");
      setShowPassword(false);
    } catch {
      alert("❌ Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const inputBase = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: "0.95rem",
    color: "#111827",
    outline: "none",
    transition: "all 0.2s ease",
  };

  const readOnlyInput = {
    ...inputBase,
    background: "#f8fafc",
    color: "#6b7280",
  };

  return (
    <>
      <div
        style={{
          maxWidth: "760px",
          margin: "24px auto",
          background: "linear-gradient(180deg, #ffffff 0%, #fffaf7 100%)",
          border: "1px solid rgba(15, 23, 42, 0.06)",
          borderRadius: "24px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* Top header */}
        <div
          style={{
            padding: "28px 28px 20px",
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.10), rgba(255,255,255,0.8))",
            borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6b35, #ffb27a)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "1.35rem",
                boxShadow: "0 12px 24px rgba(255, 107, 53, 0.22)",
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: "220px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Account Settings
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#6b7280",
                  fontSize: "0.95rem",
                }}
              >
                Manage your personal details and keep your account secure.
              </p>
            </div>

            <div
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255,107,53,0.12)",
                color: "#c2410c",
                fontWeight: "700",
                fontSize: "0.88rem",
              }}
            >
              👤 Profile
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: "28px" }}>
          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            {/* Full Name */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #eef2f7",
                borderRadius: "18px",
                padding: "18px",
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "10px",
                }}
              >
                🪪 Full Name
              </label>
              <input type="text" value={user?.fullname || ""} disabled style={readOnlyInput} />
            </div>

            {/* Username */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #eef2f7",
                borderRadius: "18px",
                padding: "18px",
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "10px",
                }}
              >
                👤 Username
              </label>
              <input type="text" value={user?.username || ""} disabled style={readOnlyInput} />
            </div>

            {/* Contact */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #eef2f7",
                borderRadius: "18px",
                padding: "18px",
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: "#374151",
                  }}
                >
                  📞 Contact Number
                </label>

                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "#6b7280",
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    padding: "6px 10px",
                    borderRadius: "999px",
                  }}
                >
                  Editable
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Enter contact number"
                  style={{
                    ...inputBase,
                    flex: 1,
                    minWidth: "220px",
                  }}
                />

                <button
                  onClick={handleContactSave}
                  disabled={updatingContact}
                  style={{
                    height: "48px",
                    padding: "0 18px",
                    borderRadius: "14px",
                    border: "none",
                    background: updatingContact
                      ? "#d1d5db"
                      : "linear-gradient(135deg, #ff6b35, #ff8a5b)",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "0.92rem",
                    cursor: updatingContact ? "not-allowed" : "pointer",
                    boxShadow: updatingContact
                      ? "none"
                      : "0 10px 20px rgba(255, 107, 53, 0.22)",
                    transition: "all 0.18s ease",
                  }}
                >
                  {updatingContact ? "Saving..." : "💾 Save Contact"}
                </button>
              </div>
            </div>

            {/* Password */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #eef2f7",
                borderRadius: "18px",
                padding: "18px",
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    🔐 Password
                  </div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      color: "#6b7280",
                    }}
                  >
                    Update your password regularly to keep your account safe.
                  </div>
                </div>

                <button
                  onClick={() => setEditingPassword(true)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "14px",
                    border: "1px solid #e5e7eb",
                    background: "#111827",
                    color: "#fff",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 10px 22px rgba(17, 24, 39, 0.16)",
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {editingPassword && (
        <div
          onClick={() => setEditingPassword(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(255,255,255,0.97)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.20)",
              padding: "24px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setEditingPassword(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "none",
                background: "#f3f4f6",
                color: "#374151",
                fontSize: "1.1rem",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: "18px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,107,53,0.12)",
                  color: "#c2410c",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  fontSize: "0.84rem",
                  marginBottom: "14px",
                }}
              >
                🔐 Security
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  color: "#111827",
                  fontWeight: "800",
                }}
              >
                Update Password
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.92rem",
                  color: "#6b7280",
                  lineHeight: 1.5,
                }}
              >
                Choose a strong password that you don’t use anywhere else.
              </p>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputBase}
              />
            </div>

            <label
              htmlFor="showPassword"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "22px",
                fontSize: "0.92rem",
                color: "#374151",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              Show password
            </label>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setEditingPassword(false)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#111827",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handlePasswordSave}
                disabled={savingPassword}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border: "none",
                  background: savingPassword
                    ? "#d1d5db"
                    : "linear-gradient(135deg, #16a34a, #22c55e)",
                  color: "#fff",
                  fontWeight: "800",
                  cursor: savingPassword ? "not-allowed" : "pointer",
                  boxShadow: savingPassword
                    ? "none"
                    : "0 12px 24px rgba(34, 197, 94, 0.22)",
                }}
              >
                {savingPassword ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileTab;