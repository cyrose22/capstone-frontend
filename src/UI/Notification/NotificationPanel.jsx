import React, { useEffect, useState } from "react";

function NotificationPanel({
  notifBounce,
  newStatusChanges,
  setNewStatusChanges,
}) {
  const [open, setOpen] = useState(false);

  // prevent background scroll when open (mobile-friendly)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  return (
    <>
      {/* 🔔 Bell Icon (same as before) */}
      <button
        className="icon-btn"
        onClick={() => setOpen(true)}
        style={{
          position: "relative",
          animation: notifBounce ? "bounce 1s infinite" : "none",
        }}
      >
        🔔
        {newStatusChanges.length > 0 && (
          <span
            className="icon-badge"
            style={{ top: "-6px", right: "-6px" }}
          >
            {newStatusChanges.length}
          </span>
        )}
      </button>

      {/* ✅ MODAL (same style as cart) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "1rem",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
            }}
          >
            {/* Close */}
            <span
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "1rem",
                fontSize: "1.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                color: "#555",
              }}
              onClick={() => setOpen(false)}
            >
              ×
            </span>

            <h3 style={{ marginBottom: "1rem" }}>
              🔔 Notifications ({newStatusChanges.length})
            </h3>

            {newStatusChanges.length === 0 ? (
              <p style={{ textAlign: "center", color: "#777" }}>
                No recent status changes
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {newStatusChanges.map((change, index) => (
                  <div
                    key={`${change.id}-${change.status}-${index}`}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "10px",
                      padding: "0.75rem",
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={() =>
                        setNewStatusChanges((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#aaa",
                        fontSize: "1.1rem",
                      }}
                    >
                      ×
                    </button>

                    <div style={{ display: "flex", gap: "0.6rem" }}>
                      <div style={{ fontSize: "1.3rem" }}>
                        {change.status === "processing" && "⏳"}
                        {change.status === "to receive" && "📦"}
                        {change.status === "cancelled" && "❌"}
                        {change.status === "completed" && "✅"}
                      </div>

                      <div style={{ flex: 1 }}>
                        <strong>Order #{change.id}</strong>

                        {change.status === "processing" && (
                          <p style={{ margin: "0.3rem 0" }}>
                            has been <strong>processed</strong>.
                          </p>
                        )}
                        {change.status === "to receive" && (
                          <p style={{ margin: "0.3rem 0" }}>
                            is now <strong>To Receive</strong>.
                          </p>
                        )}
                        {change.status === "completed" && (
                          <p style={{ margin: "0.3rem 0" }}>
                            has been <strong>Completed</strong>.
                          </p>
                        )}
                        {change.status === "cancelled" && (
                          <p style={{ margin: "0.3rem 0" }}>
                            was <strong>Cancelled</strong>.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationPanel;