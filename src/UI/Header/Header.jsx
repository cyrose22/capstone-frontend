import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, ShoppingCart } from "lucide-react";
import "./header.css";

function Header() {
  const navigate = useNavigate();

  // Get user safely
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fullname =
    user?.fullname ||
    user?.name ||
    user?.username ||
    "User";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="modern-header">
      
      {/* LEFT */}
      <div className="header-left">
        <h1 className="header-title">
          👋 Welcome back, <span>{fullname}</span>
        </h1>
      </div>

      {/* RIGHT */}
      <div className="header-right">

        <button className="icon-btn">
          <Bell size={18} />
        </button>

        <button className="icon-btn">
          <ShoppingCart size={18} />
        </button>

        <div className="avatar">
          {fullname?.charAt(0)?.toUpperCase()}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>

      </div>

    </header>
  );
}

export default Header;