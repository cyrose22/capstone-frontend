import React, { useState } from "react";

function FakeGCashModal({ total, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess(); // simulate success
    }, 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          width: "min(400px, 95vw)",
          textAlign: "center",
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        }}
      >
        <h2
          style={{
            color: "#0072CE",
            marginBottom: "12px",
            fontSize: "1.5rem",
            fontWeight: "800",
          }}
        >
          GCash
        </h2>

        <p style={{ fontSize: "1.05rem", marginBottom: "12px", color: "#334155" }}>
          You are paying: <strong>₱{Number(total).toLocaleString()}</strong>
        </p>

        {/* Simulated payment notice */}
        <div
          style={{
            background: "#f1f5f9",
            borderRadius: "10px",
            padding: "10px",
            fontSize: "13px",
            color: "#475569",
            marginBottom: "16px",
            fontWeight: "600",
          }}
        >
          ⚠️ This is a simulated GCash payment for demonstration purposes only.
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#94a3b8" : "#0072CE",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "12px",
          }}
        >
          {loading ? "Processing..." : "Pay with GCash"}
        </button>

        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#e5e7eb",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#0f172a",
            fontWeight: "600",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FakeGCashModal;