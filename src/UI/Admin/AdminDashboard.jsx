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
          {canEditPassword && (
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
          )}

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

              {(listedUser.role === 'staff' || listedUser.role === 'user') && (
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
              )}
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
      <div className="admin-dashboard-content">
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

        <h2>👥 Consumers</h2>
        <div className="user-card-grid">
          {consumerUsers.map((listedUser) => (
            <div key={listedUser.id} className="user-card">
              {renderUserCard(listedUser)}
            </div>
          ))}
        </div>

        {editingUser && (
          <div className="password-modal-overlay" onClick={closePasswordModal}>
            <div
              className="password-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePasswordModal}
                className="password-modal-close"
                type="button"
              >
                ✕
              </button>

              <div className="password-modal-head">
                <div className="password-modal-chip">🔐 Security</div>

                <h2>Change Password</h2>
                <p>Update password for {editingUser.fullname}</p>
              </div>

              <div className="password-modal-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="password-modal-input"
                />
              </div>

              <div className="password-modal-checkbox">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword((prev) => !prev)}
                />
                <label htmlFor="showPassword">Show password</label>
              </div>

              <div className="password-modal-actions">
                <button
                  onClick={closePasswordModal}
                  className="password-cancel-btn"
                  type="button"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSavePassword}
                  disabled={saving || !newPassword.trim()}
                  className="password-save-btn"
                  type="button"
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
    </div>
  );
}

export default AdminDashboard;