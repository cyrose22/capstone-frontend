import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiDollarSign,
  FiBox,
  FiMenu,
  FiX,
} from "react-icons/fi";
import logo from "../../assets/logo.png";
import "./sidebar.css";

function Sidebar() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [isOpen, setIsOpen] = useState(false);

  if (!user || user.role === "pending") return null;

  return (
    <>
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className="mobile-brand">
          <img src={logo} alt="Oscar D’Gr8 Logo" className="mobile-brand-logo" />
          <h2>Admin Panel</h2>
        </div>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-top">
            <img src={logo} alt="Oscar D’Gr8 Logo" className="sidebar-logo-img" />
            <div>
              <h2 className="logo">Admin Panel</h2>
              <p className="sidebar-subtitle">Oscar D’Gr8</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard/admin" onClick={() => setIsOpen(false)}>
                <FiUsers />
                <span>Users</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard/sales" onClick={() => setIsOpen(false)}>
                <FiDollarSign />
                <span>Sales</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard/products" onClick={() => setIsOpen(false)}>
                <FiBox />
                <span>Products</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;