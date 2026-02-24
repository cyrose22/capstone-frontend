// AdminDashboard.js
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
  const navigate = useNavigate();
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ fullname: '', username: '', password: '' });
  const [registering, setRegistering] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);


  const loggedInUser = localStorage.getItem('username') || '';
  const loggedInRole = localStorage.getItem('role') || '';
  const fullname = localStorage.getItem('fullname');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/users');
      setUsers(res.data);
    } catch {
      alert('Failed to load users');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setDeletingId(id);
      await axios.delete(`http://localhost:5000/users/${id}`);
      fetchUsers();
    } catch {
      alert('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserRole = (user) => {
    if (user.role === 'user') {
      alert('Only staff can be promoted or demoted.');
      return;
    }

    if (user.role === 'admin') {
      // If user is admin, allow demotion only if it's NOT the logged-in admin themselves
      if (user.username === loggedInUser) {
        alert('You cannot demote yourself.');
        return;
      }
      // demote admin to staff
      axios.put(`http://localhost:5000/users/${user.id}/role`, { role: 'staff' })
        .then(() => {
          alert('Admin demoted to Staff');
          fetchUsers();
        })
        .catch(() => alert('Error updating role'));
      return;
    }

    if (user.role === 'staff') {
      // promote staff to admin
      axios.put(`http://localhost:5000/users/${user.id}/role`, { role: 'admin' })
        .then(() => {
          alert('Staff promoted to Admin');
          fetchUsers();
        })
        .catch(() => alert('Error updating role'));
      return;
    }
  };


  const handleStaffRegister = async () => {
    try {
      setRegistering(true);
      await axios.post('http://localhost:5000/register', {
        fullname: newStaff.fullname,
        username: newStaff.username,
        password: newStaff.password,
        role: 'staff',
        contact: null
      });
      alert('Staff registered successfully!');
      setNewStaff({ fullname: '', username: '', password: '' });
      fetchUsers();
      setShowRegisterModal(false);  // <-- Close the modal here
    } catch (err) {
      console.error('Error registering staff:', err);
      alert('Failed to register staff');
    } finally {
      setRegistering(false);
    }
  };

  const renderUserCard = (user) => {
    const isSelf = user.username === loggedInUser;

    const canEditPassword =
      loggedInRole === 'admin' ||
      (loggedInRole === 'staff' && (user.role === 'user' || isSelf))
    // const canEditPassword = loggedInRole === 'user' && isSelf;
      
    return (
      <>
        <div className="user-header">
          <h3>{user.fullname}</h3>
          <span className={`role-badge ${user.role || 'null'}`}>{user.role || 'pending'}</span>
        </div>
        <p><strong>Username:</strong> {user.username}</p>

        <div className="user-actions">
          {canEditPassword && (
            <div
              className="button-with-toast"
              onMouseEnter={() => setHovered(`edit-${user.id}`)}
              onMouseLeave={() => setHovered(null)}
            >
              <button onClick={() => setEditingUser(user)} className="edit-user">
                <FaEdit />
              </button>
              {hovered === `edit-${user.id}` && <span className="toast">Change Password</span>}
            </div>
          )}

          {/* Admin-only actions like delete, promote/demote, but exclude self */}
          {loggedInRole === 'admin' && !isSelf && (
            <>
              {/* Promote button for staff only */}
              {user.role === 'staff' && (
                <div
                  className="button-with-toast"
                  onMouseEnter={() => setHovered(`toggle-${user.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button className="toggle-role" onClick={() => toggleUserRole(user)}>
                    Make Admin
                  </button>
                  {hovered === `toggle-${user.id}` && <span className="toast">Make Admin</span>}
                </div>
              )}

              {/* Demote button for admins except self */}
              {user.role === 'admin' && user.username !== loggedInUser && (
                <div
                  className="button-with-toast"
                  onMouseEnter={() => setHovered(`toggle-${user.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button className="toggle-role" onClick={() => toggleUserRole(user)}>
                    Demote to Staff
                  </button>
                  {hovered === `toggle-${user.id}` && <span className="toast">Remove as Admin</span>}
                </div>
              )}

              {/* Delete button for staff */}
              {user.role === 'staff' && (
                <div
                  className="button-with-toast"
                  onMouseEnter={() => setHovered(`delete-${user.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    className="delete-user"
                    onClick={() => deleteUser(user.id)}
                    disabled={deletingId === user.id}
                  >
                    <FaTrash />
                  </button>
                  {hovered === `delete-${user.id}` && <span className="toast">Delete Staff</span>}
                </div>
              )}

              {/* Delete button for users */}
              {user.role === 'user' && (
                <div
                  className="button-with-toast"
                  onMouseEnter={() => setHovered(`delete-${user.id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    className="delete-user"
                    onClick={() => deleteUser(user.id)}
                    disabled={deletingId === user.id}
                  >
                    <FaTrash />
                  </button>
                  {hovered === `delete-${user.id}` && <span className="toast">Delete User</span>}
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="admin-dashboard">
      <Header title="🧑‍💼 Admin Dashboard" />

      {loggedInRole === 'admin' && (
        <div className="register-staff-container">
          <br/>
          <button className="register-staff-btn" onClick={() => setShowRegisterModal(true)}>
            <FaUserPlus /> Register New Staff
          </button>
        </div>
      )}

      {loggedInRole !== 'staff' && (
        <>
          <h2>🛡️ Admins</h2>
          <div className="user-card-grid">
            {users
              .filter(user => user.role === 'admin')
              .map((user) => (
                <div key={user.id} className="user-card">
                  {renderUserCard(user)}
                </div>
            ))}
          </div>
        </>
      )}

      <h2>👨‍💼 Staff</h2>
      <div className="user-card-grid">
        {users
          .filter(user => user.role === 'staff')
          .map((user) => (
            <div key={user.id} className="user-card">
              {renderUserCard(user)}
            </div>
        ))}
      </div>

      <h2>👤 Customer</h2>
      <div className="user-card-grid">
        {users.filter(user => user.role === 'user').map((user) => (
          <div key={user.id} className="user-card">
            {renderUserCard(user)}
          </div>
        ))}
      </div>

      {/* Password Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content animated-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditingUser(null)}>&times;</button>
            <div className="modal-header">
              <h2>🔐 Update Password</h2>
              <p>Updating password for <strong>{editingUser.fullname}</strong></p>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="modal-input styled-input"
            />
            <div className="show-password-toggle">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setEditingUser(null)}>❌ Cancel</button>
              <button
                className="save-btn"
                onClick={async () => {
                  if (!newPassword.trim()) return alert("Password can't be empty");
                  try {
                    setSaving(true);
                    await axios.put(`http://localhost:5000/users/${editingUser.id}/password`, {
                      password: newPassword,
                    });
                    alert('Password updated!');
                    setEditingUser(null);
                    setNewPassword('');
                  } catch {
                    alert('Failed to update password.');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Staff Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content animated-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRegisterModal(false)}>&times;</button>
            <div className="modal-header">
              <h2>🆕 New Staff</h2>
            </div>
            <input
              type="text"
              placeholder="Full Name"
              value={newStaff.fullname}
              onChange={(e) => setNewStaff({ ...newStaff, fullname: e.target.value })}
              className="modal-input styled-input"
            />
            <input
              type="text"
              placeholder="Username"
              value={newStaff.username}
              onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
              className="modal-input styled-input"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={newStaff.password}
              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              className="modal-input styled-input"
            />
            <div className="show-password-toggle">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowRegisterModal(false)}>❌ Cancel</button>
              <button
                className="save-btn"
                onClick={handleStaffRegister}
                disabled={registering}
              >
                {registering ? 'Registering...' : '✅ Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
