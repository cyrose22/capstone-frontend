import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Don't render sidebar if no user or user is pending
  if (!user || user.role === 'pending') return null;

  return (
    <aside className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li>
          <NavLink to="/dashboard/admin" className={({ isActive }) => isActive ? 'active' : ''}>
            🧑‍💼 Users
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/sales" className={({ isActive }) => isActive ? 'active' : ''}>
            💰 Sales
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/products" className={({ isActive }) => isActive ? 'active' : ''}>
            📦 Products
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
