import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function NotificationPanel({
  notifBounce,
  notifications,
  setNotifications,
  user,
}) {
  const [open, setOpen] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const safeNotifications = user?.id ? notifications || [] : [];

  const unreadCount = useMemo(
    () => safeNotifications.filter((item) => !item.is_read).length,
    [safeNotifications]
  );

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Just now";

    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const getStatusIcon = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "processing") return "⏳";
    if (value === "to receive") return "📦";
    if (value === "completed") return "✅";
    if (value === "cancelled") return "❌";
    return "🔔";
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!user?.id) {
      setOpen(false);
      setNotifications([]);
    }
  }, [user, setNotifications]);

  const markOneAsRead = async (notificationId) => {
    try {
      await axios.put(
        `https://capstone-backend-kiax.onrender.com/notifications/${notificationId}/read`
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await axios.put(
        `https://capstone-backend-kiax.onrender.com/notifications/user/${user.id}/read-all`
      );

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteOne = async (notificationId) => {
    try {
      await axios.delete(
        `https://capstone-backend-kiax.onrender.com/notifications/${notificationId}`
      );

      setNotifications((prev) =>
        prev.filter((item) => item.id !== notificationId)
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const deleteAll = async () => {
    if (!user?.id) return;

    try {
      await axios.delete(
        `https://capstone-backend-kiax.onrender.com/notifications/user/${user.id}/clear`
      );

      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const sortedNotifications = [...safeNotifications].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  if (!user?.id) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <button
        className="icon-btn"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "relative",
          animation: notifBounce ? "bounce 1s infinite" : "none",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="icon-badge"
            style={{ top: "-6px", right: "-6px" }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              zIndex: 2999,
            }}
          />

          <div
            style={{
              position: isMobile ? "fixed" : "absolute",
              top: isMobile ? "88px" : "calc(100% + 12px)",
              right: isMobile ? "8px" : 0,
              left: isMobile ? "8px" : "auto",
              width: isMobile ? "calc(100vw - 16px)" : "min(420px, 92vw)",
              maxHeight: isMobile ? "70vh" : "70vh",
              overflowY: "auto",
              backgroundColor: "#fff",
              borderRadius: isMobile ? "16px" : "18px",
              padding: isMobile ? "0.85rem" : "1rem",
              boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
              border: "1px solid rgba(17,24,39,0.08)",
              zIndex: 3000,
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                border: "none",
                background: "transparent",
                fontSize: "1.6rem",
                fontWeight: "bold",
                cursor: "pointer",
                color: "#555",
                zIndex: 5,
              }}
            >
              ×
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "10px",
                paddingRight: "28px",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0 }}>
                🔔 Notifications ({safeNotifications.length})
              </h3>

              {safeNotifications.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={markAllAsRead}
                    style={{
                      border: "1px solid #ddd",
                      background: "#fff",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Mark all as read
                  </button>

                  <button
                    onClick={deleteAll}
                    style={{
                      border: "1px solid #fecaca",
                      background: "#fff5f5",
                      color: "#dc2626",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {sortedNotifications.length === 0 ? (
              <p style={{ textAlign: "center", color: "#777" }}>
                No recent notifications
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {sortedNotifications.map((change) => (
                  <div
                    key={change.id}
                    style={{
                      border: change.is_read
                        ? "1px solid #eee"
                        : "1px solid #fde68a",
                      background: change.is_read ? "#fff" : "#fffdf4",
                      borderRadius: "12px",
                      padding: "0.85rem",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      {!change.is_read && (
                        <button
                          onClick={() => markOneAsRead(change.id)}
                          style={{
                            border: "none",
                            background: "#eff6ff",
                            color: "#2563eb",
                            cursor: "pointer",
                            borderRadius: "8px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Read
                        </button>
                      )}

                      <button
                        onClick={() => deleteOne(change.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#aaa",
                          fontSize: "1.1rem",
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <div style={{ fontSize: "1.3rem", marginTop: "2px" }}>
                        {getStatusIcon(change.status)}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          paddingRight: isMobile ? "52px" : "64px",
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "4px" }}>
                          Order #{change.sale_id}
                        </strong>

                        <p
                          style={{
                            margin: "0.25rem 0",
                            color: "#374151",
                            lineHeight: 1.45,
                            wordBreak: "break-word",
                          }}
                        >
                          {change.message}
                        </p>

                        <p
                          style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.82rem",
                            color: "#888",
                          }}
                        >
                          {getTimeAgo(change.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationPanel;