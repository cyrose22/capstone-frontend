import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiUsers, FiDollarSign, FiBox, FiMenu, FiX } from "react-icons/fi";
import "./sidebar.css";

function Sidebar() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [isOpen, setIsOpen] = useState(false);

  if (!user || user.role === "pending") return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h2>Admin Panel</h2>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="logo">Admin Panel</h2>

        <ul>
          <li>
            <NavLink to="/dashboard/admin">
              <FiUsers /> Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/sales">
              <FiDollarSign /> Sales
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/products">
              <FiBox /> Products
            </NavLink>
          </li>
        </ul>
      </aside>
    </>
  );
}

export default Sidebar;