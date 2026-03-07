import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './admin-dashboard.css';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaUserPlus } from 'react-icons/fa';
import Header from '../Header/Header';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  useEffect(() => {
    if (!user?.token) {
      navigate('/');
    } else if (user.role !== 'admin') {
      navigate('/dashboard/consumer');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.token && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  if (!user?.token || user.role !== 'admin') {
    return null;
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        'https://capstone-backend-kiax.onrender.com/users'
      );
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      alert('Failed to load users');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setDeletingId(id);
      await axios.delete(
        `https://capstone-backend-kiax.onrender.com/users/${id}`
      );
      await fetchUsers();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed');
    } finally {
      setDeletingId(null);
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
        await axios.put(
          `https://capstone-backend-kiax.onrender.com/users/${selectedUser.id}/role`,
          { role: 'staff' }
        );
        alert('Admin demoted to Staff');
        await fetchUsers();
      } catch (err) {
        console.error('Error updating role:', err);
        alert('Error updating role');
      }
      return;
    }

    if (selectedUser.role === 'staff') {
      try {
        await axios.put(
          `https://capstone-backend-kiax.onrender.com/users/${selectedUser.id}/role`,
          { role: 'admin' }
        );
        alert('Staff promoted to Admin');
        await fetchUsers();
      } catch (err) {
        console.error('Error updating role:', err);
        alert('Error updating role');
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

  const renderUserCard = (listedUser) => {
    const isSelf = listedUser.username === loggedInUser;

    const canEditPassword =
      loggedInRole === 'admin' ||
      (loggedInRole === 'staff' &&
        (listedUser.role === 'user' || isSelf));

    return (
      <>
        <div className="user-header">
          <h3>{listedUser.fullname}</h3>
          <span className={`role-badge ${listedUser.role || 'null'}`}>
            {listedUser.role || 'pending'}
          </span>
        </div>

        <p>
          <strong>Username:</strong> {listedUser.username}
        </p>

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
                  onMouseEnter={() => setHovered(`toggle-${listedUser.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    className="toggle-role"
                    onClick={() => toggleUserRole(listedUser)}
                    type="button"
                  >
                    Make Admin
                  </button>
                  {hovered === `toggle-${listedUser.id}` && (
                    <span className="toast">Make Admin</span>
                  )}
                </div>
              )}

              {listedUser.role === 'admin' &&
                listedUser.username !== loggedInUser && (
                  <div
                    className="button-with-toast"
                    onMouseEnter={() => setHovered(`toggle-${listedUser.id}`)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <button
                      className="toggle-role"
                      onClick={() => toggleUserRole(listedUser)}
                      type="button"
                    >
                      Demote to Staff
                    </button>
                    {hovered === `toggle-${listedUser.id}` && (
                      <span className="toast">Remove as Admin</span>
                    )}
                  </div>
                )}

              {(listedUser.role === 'staff' || listedUser.role === 'user') && (
                <div
                  className="button-with-toast"
                  onMouseEnter={() => setHovered(`delete-${listedUser.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    className="delete-user"
                    onClick={() => deleteUser(listedUser.id)}
                    disabled={deletingId === listedUser.id}
                    type="button"
                  >
                    <FaTrash />
                  </button>
                  {hovered === `delete-${listedUser.id}` && (
                    <span className="toast">
                      {listedUser.role === 'staff'
                        ? 'Delete Staff'
                        : 'Delete User'}
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
  const consumerUsers = users.filter(
    (listedUser) => listedUser.role === 'user'
  );

  return (
    <div className="admin-dashboard">
      <Header title="🧑‍💼 Admin Dashboard" />

      {loggedInRole === 'admin' && (
        <div className="register-staff-container">
          <button
            className="register-staff-btn"
            onClick={() => setShowRegisterModal(true)}
            type="button"
          >
            <FaUserPlus /> Register New Staff
          </button>
        </div>
      )}

      {loggedInRole !== 'staff' && (
        <>
          <h2>🛡️ Admins</h2>
          <div className="user-card-grid">
            {adminUsers.map((listedUser) => (
              <div key={listedUser.id} className="user-card">
                {renderUserCard(listedUser)}
              </div>
            ))}
          </div>
        </>
      )}

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
        <div
          className="modal-overlay"
          onClick={() => {
            setEditingUser(null);
            setNewPassword('');
            setShowPassword(false);
          }}
        >
          <div
            className="modal-content animated-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                setEditingUser(null);
                setNewPassword('');
                setShowPassword(false);
              }}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>Change Password</h2>
              <p>Update password for {editingUser.fullname}</p>
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              className="modal-input styled-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="show-password-toggle">
              <input
                id="showPassword"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setNewPassword('');
                  setShowPassword(false);
                }}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                type="button"
                onClick={handleSavePassword}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowRegisterModal(false);
            setShowStaffPassword(false);
          }}
        >
          <div
            className="modal-content animated-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                setShowRegisterModal(false);
                setShowStaffPassword(false);
              }}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>Register New Staff</h2>
              <p>Create a new staff account.</p>
            </div>

            <input
              type="text"
              className="modal-input styled-input"
              placeholder="Full name"
              value={newStaff.fullname}
              onChange={(e) =>
                setNewStaff((prev) => ({
                  ...prev,
                  fullname: e.target.value,
                }))
              }
            />

            <input
              type="email"
              className="modal-input styled-input"
              placeholder="Email / Username"
              value={newStaff.username}
              onChange={(e) =>
                setNewStaff((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            />

            <input
              type={showStaffPassword ? 'text' : 'password'}
              className="modal-input styled-input"
              placeholder="Password"
              value={newStaff.password}
              onChange={(e) =>
                setNewStaff((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />

            <div className="show-password-toggle">
              <input
                id="showStaffPassword"
                type="checkbox"
                checked={showStaffPassword}
                onChange={() => setShowStaffPassword((prev) => !prev)}
              />
              <label htmlFor="showStaffPassword">Show Password</label>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                type="button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowStaffPassword(false);
                }}
              >
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