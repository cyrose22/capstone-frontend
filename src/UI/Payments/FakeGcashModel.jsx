import React, { useEffect, useState } from "react";

function FakeGCashModal({ total, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(); // proceed back to app
    }, 2000); // simulate delay
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          width: "400px",
          textAlign: "center",
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ color: "#0072CE", marginBottom: "1rem" }}>GCash</h2>
        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          You are paying: <strong>₱{total.toLocaleString()}</strong>
        </p>

        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#0072CE",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          {loading ? "⏳ Processing..." : "Pay with GCash"}
        </button>

        <button
          onClick={onCancel}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#ccc",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FakeGCashModal;
