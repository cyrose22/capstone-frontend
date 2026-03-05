import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import axios from "axios";
import "./header.css";

function Header() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fullname = user?.fullname || user?.name || user?.username || "User";
  const role = user?.role;

  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Store last time admin checked notifications
  const getSince = () =>
    localStorage.getItem("admin_last_seen_orders") ||
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const setSinceNow = () =>
    localStorage.setItem("admin_last_seen_orders", new Date().toISOString());

  useEffect(() => {
    if (role !== "admin") return;

    let isMounted = true;

    const fetchCount = async () => {
      try {
        const since = getSince();
        const res = await axios.get(
          `https://capstone-backend-kiax.onrender.com/admin/new-orders-count?since=${encodeURIComponent(
            since
          )}`
        );
        if (!isMounted) return;
        setNewOrdersCount(res.data.count || 0);
      } catch (err) {
        // keep silent (optional)
        console.error("Failed to fetch new orders count", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000); // every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleBellClick = () => {
    // mark notifications as seen
    setSinceNow();
    setNewOrdersCount(0);

    // go to sales page and open Processing tab
    navigate("/dashboard/sales", { state: { status: "processing" } });
  };

  return (
    <header className="modern-header">
      <div className="header-left">
        <h1 className="header-title">
          👋 Welcome back, <span>{fullname}</span>
        </h1>
      </div>

      <div className="header-right">
        {/* Bell ONLY for admin */}
        {role === "admin" && (
          <button
            className={`icon-btn notification-btn ${newOrdersCount > 0 ? "has-new" : ""}`}
            onClick={handleBellClick}
            aria-label="Notifications"
            title="New Orders"
          >
            <Bell size={18} />
            {newOrdersCount > 0 && (
              <span className="notif-badge">
                {newOrdersCount > 99 ? "99+" : newOrdersCount}
              </span>
            )}
          </button>
        )}

        {/* ✅ removed avatar */}

        <button className="logout-modern" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;