import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './admin-dashboard.css';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaUserPlus } from 'react-icons/fa';
import Header from '../Header/Header';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullname: '',
    username: '',
    password: '',
  });
  const [registering, setRegistering] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const loggedInUser = user?.username || '';
  const loggedInRole = user?.role || '';

  const token = user?.token;
  const role = user?.role;

  const fetchUsers = React.useCallback(async () => {
    try {
      const res = await axios.get('https://capstone-backend-kiax.onrender.com/users');
      const normalizedUsers = (res.data || []).map((listedUser) => ({
        ...listedUser,
        status: listedUser.status || 'active',
      }));
      setUsers(normalizedUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      alert('Failed to load users');
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else if (role !== 'admin') {
      navigate('/dashboard/consumer');
    }
  }, [token, role, navigate]);

  useEffect(() => {
    if (token && role === 'admin') {
      fetchUsers();
    }
  }, [token, role, fetchUsers]);

  const toggleUserStatus = async (selectedUser) => {
    const isDeactivating = selectedUser.status !== 'inactive';

    const confirmMessage = isDeactivating
      ? `Are you sure you want to deactivate ${selectedUser.fullname}?`
      : `Are you sure you want to activate ${selectedUser.fullname}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoadingId(selectedUser.id);

      await axios.put(
        `https://capstone-backend-kiax.onrender.com/users/${selectedUser.id}/status`,
        {
          status: isDeactivating ? 'inactive' : 'active',
        }
      );

      await fetchUsers();

      alert(
        isDeactivating
          ? 'User deactivated successfully.'
          : 'User activated successfully.'
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update account status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleUserRole = async (selectedUser) => {
    if (selectedUser.role === 'user') {
      alert('Only staff can be promoted or demoted.');
      return;
    }

    if (selectedUser.role === 'admin') {
      if (selectedUser.username === loggedInUser) {
        alert('You cannot demote yourself.');
        return;
      }

      try {
        setActionLoadingId(selectedUser.id);
        await axios.put(
          `https://capstone-backend-kiax.onrender.com/users/${selectedUser.id}/role`,
          { role: 'staff' }
        );
        alert('Admin demoted to Staff');
        await fetchUsers();
      } catch (err) {
        console.error('Error updating role:', err);
        alert('Error updating role');
      } finally {
        setActionLoadingId(null);
      }
      return;
    }

    if (selectedUser.role === 'staff') {
      try {
        setActionLoadingId(selectedUser.id);
        await axios.put(
          `https://capstone-backend-kiax.onrender.com/users/${selectedUser.id}/role`,
          { role: 'admin' }
        );
        alert('Staff promoted to Admin');
        await fetchUsers();
      } catch (err) {
        console.error('Error updating role:', err);
        alert('Error updating role');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleSavePassword = async () => {
    if (!editingUser) return;

    if (!newPassword || newPassword.trim().length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `https://capstone-backend-kiax.onrender.com/users/${editingUser.id}/password`,
        { password: newPassword }
      );

      alert('Password updated successfully!');
      setEditingUser(null);
      setNewPassword('');
      setShowPassword(false);
    } catch (err) {
      console.error('Failed to update password:', err);
      alert('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleStaffRegister = async () => {
    if (
      !newStaff.fullname.trim() ||
      !newStaff.username.trim() ||
      !newStaff.password.trim()
    ) {
      alert('Please complete all fields.');
      return;
    }

    if (newStaff.password.trim().length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      setRegistering(true);

      await axios.post('https://capstone-backend-kiax.onrender.com/register', {
        fullname: newStaff.fullname,
        username: newStaff.username,
        password: newStaff.password,
        role: 'staff',
        contact: null,
        address: null,
        province: null,
        municipality: null,
        barangay: null,
        street: null,
        block: null,
      });

      alert('Staff registered successfully!');
      setNewStaff({ fullname: '', username: '', password: '' });
      setShowRegisterModal(false);
      setShowStaffPassword(false);
      await fetchUsers();
    } catch (err) {
      console.error('Error registering staff:', err);
      alert('Failed to register staff');
    } finally {
      setRegistering(false);
    }
  };

  const closePasswordModal = () => {
    setEditingUser(null);
    setNewPassword('');
    setShowPassword(false);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setNewStaff({ fullname: '', username: '', password: '' });
    setShowStaffPassword(false);
  };

  const renderUserCard = (listedUser) => {
    const isSelf = listedUser.username === loggedInUser;
    const isInactive = listedUser.status === 'inactive';

    const canEditPassword =
      loggedInRole === 'admin' ||
      (loggedInRole === 'staff' && (listedUser.role === 'user' || isSelf));

    return (
      <>
        <div className="user-header">
          <div className="user-main">
            <h3>{listedUser.fullname}</h3>
            <p className="user-meta">
              <strong>Username:</strong> {listedUser.username}
            </p>
          </div>

          <div className="user-badges">
            <span className={`status-badge ${isInactive ? 'inactive' : 'active'}`}>
              {isInactive ? 'Inactive' : 'Active'}
            </span>

            <span className={`role-badge ${listedUser.role || 'null'}`}>
              {listedUser.role || 'pending'}
            </span>
          </div>
        </div>

        {listedUser.role === 'staff' && (
          <p className="staff-note">
            Internal staff account only. No customer registration address required.
          </p>
        )}

        <div className="user-actions">
          {/* {canEditPassword && (
            <div
              className="button-with-toast"
              onMouseEnter={() => setHovered(`edit-${listedUser.id}`)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                onClick={() => {
                  setEditingUser(listedUser);
                  setNewPassword('');
                  setShowPassword(false);
                }}
                className="edit-user"
                type="button"
              >
                <FaEdit />
              </button>
              {hovered === `edit-${listedUser.id}` && (
                <span className="toast">Change Password</span>
              )}
            </div>
          )} */}

          {loggedInRole === 'admin' && !isSelf && (
            <>
              {listedUser.role === 'staff' && (
                <div
                  className="button-with-toast"
                  onMouseEnter={() => setHovered(`toggle-role-${listedUser.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    className="toggle-role"
                    onClick={() => toggleUserRole(listedUser)}
                    type="button"
                    disabled={actionLoadingId === listedUser.id}
                  >
                    {actionLoadingId === listedUser.id ? 'Please wait...' : 'Make Admin'}
                  </button>
                  {hovered === `toggle-role-${listedUser.id}` && (
                    <span className="toast">Promote staff to admin</span>
                  )}
                </div>
              )}

              {listedUser.role === 'admin' &&
                listedUser.username !== loggedInUser && (
                  <div
                    className="button-with-toast"
                    onMouseEnter={() => setHovered(`toggle-role-${listedUser.id}`)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <button
                      className="toggle-role"
                      onClick={() => toggleUserRole(listedUser)}
                      type="button"
                      disabled={actionLoadingId === listedUser.id}
                    >
                      {actionLoadingId === listedUser.id
                        ? 'Please wait...'
                        : 'Demote to Staff'}
                    </button>
                    {hovered === `toggle-role-${listedUser.id}` && (
                      <span className="toast">Remove admin access</span>
                    )}
                  </div>
                )}

              {/* {(listedUser.role === 'staff' || listedUser.role === 'user') && (
                <div
                  className="button-with-toast"
                  onMouseEnter={() => setHovered(`status-${listedUser.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    className={`toggle-status ${isInactive ? 'activate' : 'deactivate'}`}
                    onClick={() => toggleUserStatus(listedUser)}
                    disabled={actionLoadingId === listedUser.id}
                    type="button"
                  >
                    {actionLoadingId === listedUser.id
                      ? 'Please wait...'
                      : isInactive
                      ? 'Activate'
                      : 'Deactivate'}
                  </button>
                  {hovered === `status-${listedUser.id}` && (
                    <span className="toast">
                      {isInactive ? 'Restore account access' : 'Disable account access'}
                    </span>
                  )}
                </div>
              )} */}
            </>
          )}
        </div>
      </>
    );
  };

  const adminUsers = users.filter((listedUser) => listedUser.role === 'admin');
  const staffUsers = users.filter((listedUser) => listedUser.role === 'staff');
  const consumerUsers = users.filter((listedUser) => listedUser.role === 'user');

  return (
    <div className="admin-dashboard">
      <Header title="🧑‍💼 Admin Dashboard" />

      <div className="register-staff-container">
        <button
          className="register-staff-btn"
          onClick={() => setShowRegisterModal(true)}
          type="button"
        >
          <FaUserPlus /> Register New Staff
        </button>
      </div>

      <h2>🛡️ Admins</h2>
      <div className="user-card-grid">
        {adminUsers.map((listedUser) => (
          <div key={listedUser.id} className="user-card">
            {renderUserCard(listedUser)}
          </div>
        ))}
      </div>

      <h2>👨‍💼 Staff</h2>
      <div className="user-card-grid">
        {staffUsers.map((listedUser) => (
          <div key={listedUser.id} className="user-card">
            {renderUserCard(listedUser)}
          </div>
        ))}
      </div>

      <h2>👥 Users</h2>
      <div className="user-card-grid">
        {consumerUsers.map((listedUser) => (
          <div key={listedUser.id} className="user-card">
            {renderUserCard(listedUser)}
          </div>
        ))}
      </div>

      {editingUser && (
        <div
          onClick={closePasswordModal}
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
              onClick={closePasswordModal}
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
                Change Password
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.92rem",
                  color: "#6b7280",
                  lineHeight: 1.5,
                }}
              >
                Update password for {editingUser.fullname}
              </p>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  fontSize: "0.95rem",
                  color: "#111827",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "22px",
              }}
            >
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                style={{
                  width: "18px",
                  height: "18px",
                  margin: 0,
                  cursor: "pointer",
                  accentColor: "#22c55e",
                  flexShrink: 0,
                }}
              />

              <label
                htmlFor="showPassword"
                style={{
                  fontSize: "0.92rem",
                  color: "#374151",
                  cursor: "pointer",
                  userSelect: "none",
                  lineHeight: 1.2,
                }}
              >
                Show password
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={closePasswordModal}
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
                onClick={handleSavePassword}
                disabled={saving || !newPassword.trim()}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border: "none",
                  background:
                    saving || !newPassword.trim()
                      ? "#d1d5db"
                      : "linear-gradient(135deg, #16a34a, #22c55e)",
                  color: "#fff",
                  fontWeight: "800",
                  cursor: saving || !newPassword.trim() ? "not-allowed" : "pointer",
                  opacity: saving || !newPassword.trim() ? 0.7 : 1,
                  boxShadow:
                    saving || !newPassword.trim()
                      ? "none"
                      : "0 12px 24px rgba(34, 197, 94, 0.22)",
                }}
              >
                {saving ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay" onClick={closeRegisterModal}>
          <div
            className="modal-content register-modal animated-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={closeRegisterModal}>
              ×
            </button>

            <div className="modal-header compact">
              <div className="modal-chip">👨‍💼 Staff Access</div>
              <h2>Register New Staff</h2>
              <p>
                Staff accounts are for site access only. No customer address details are
                required.
              </p>
            </div>

            <div className="form-stack">
              <input
                type="text"
                className="modal-input styled-input"
                placeholder="Full name"
                value={newStaff.fullname}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, fullname: e.target.value }))
                }
              />

              <input
                type="text"
                className="modal-input styled-input"
                placeholder="Username"
                value={newStaff.username}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, username: e.target.value }))
                }
              />

              <input
                type={showStaffPassword ? 'text' : 'password'}
                className="modal-input styled-input"
                placeholder="Password"
                value={newStaff.password}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, password: e.target.value }))
                }
              />

              <div className="checkbox-row register-checkbox">
                <input
                  type="checkbox"
                  id="showStaffPassword"
                  checked={showStaffPassword}
                  onChange={() => setShowStaffPassword((prev) => !prev)}
                />
                <label htmlFor="showStaffPassword">Show password</label>
              </div>
            </div>

            <div className="modal-actions register-actions">
              <button className="cancel-btn" type="button" onClick={closeRegisterModal}>
                Cancel
              </button>
              <button
                className="save-btn"
                type="button"
                onClick={handleStaffRegister}
                disabled={registering}
              >
                {registering ? 'Registering...' : 'Register Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;