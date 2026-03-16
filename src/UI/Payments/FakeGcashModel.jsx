import React, { useState } from "react";

function FakeGCashModal({ total, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const isValidPHNumber = (value) => {
    const cleaned = value.trim();
    return /^(09\d{9}|639\d{9}|\+639\d{9})$/.test(cleaned);
  };

  const handlePay = () => {
    if (!isValidPHNumber(contact)) {
      setError("Please enter a valid GCash number.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess();
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
          width: "min(420px, 95vw)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Close GCash modal"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: "10px",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "18px",
            color: "#0f172a",
          }}
        >
          ×
        </button>

        <h2
          style={{
            color: "#0f172a",
            marginBottom: "12px",
            fontSize: "1.5rem",
            fontWeight: "800",
          }}
        >
          💳 GCash Payment
        </h2>

        <p
          style={{
            fontSize: "1.05rem",
            marginBottom: "12px",
            color: "#334155",
            fontWeight: "600",
          }}
        >
          Amount to pay: <strong>₱{Number(total).toLocaleString()}</strong>
        </p>

        <div
          style={{
            fontSize: "13px",
            color: "#475569",
            marginBottom: "14px",
            fontWeight: "600",
          }}
        >
          This is a simulated GCash payment for demonstration purposes only.
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#334155",
            }}
          >
            GCash number
          </label>

          <input
            type="text"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              if (error) setError("");
            }}
            placeholder="09XXXXXXXXX"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: "14px",
              border: error
                ? "1px solid #ef4444"
                : "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontSize: "1rem",
              fontWeight: "700",
              color: "#0f172a",
              background: "#fff",
            }}
          />

          {error && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#ef4444",
                fontWeight: "600",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handlePay}
            disabled={loading || !contact.trim()}
            style={{
              flex: 1,
              padding: "12px",
              background: loading || !contact.trim()
                ? "#94a3b8"
                : "linear-gradient(135deg, #2563eb, #0ea5e9)",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "700",
              border: "none",
              borderRadius: "12px",
              cursor: loading || !contact.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Pay with GCash"}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "12px 18px",
              backgroundColor: "#e5e7eb",
              border: "none",
              borderRadius: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              color: "#0f172a",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FakeGCashModal;