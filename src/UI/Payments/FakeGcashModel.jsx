import React, { useMemo, useState } from "react";

function FakeGCashModal({ total, user, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(user?.contact || "");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const normalizeContact = (num) => {
    const cleaned = String(num || "").trim();

    if (/^09\d{9}$/.test(cleaned)) return `+63${cleaned.slice(1)}`;
    if (/^639\d{9}$/.test(cleaned)) return `+${cleaned}`;
    if (/^\+639\d{9}$/.test(cleaned)) return cleaned;

    return "";
  };

  const isValid = useMemo(() => Boolean(normalizeContact(contact)), [contact]);

  const handlePay = () => {
    const normalized = normalizeContact(contact);

    if (!normalized) {
      setError("Enter a valid GCash number.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const reference = `GCASH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      onSuccess(reference, normalized);
    }, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.58)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 30000,
      }}
    >
      <div
        style={{
          width: "min(430px, 96vw)",
          borderRadius: 24,
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0057ff, #00a8ff)",
            padding: "18px 18px 20px",
            color: "#fff",
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
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.24)",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 18,
              backdropFilter: "blur(6px)",
            }}
          >
            ×
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "rgba(255,255,255,0.16)",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              ₱
            </div>

            <div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>
                GCash Payment
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  opacity: 0.92,
                }}
              >
                Secure checkout simulation
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <div
            style={{
              borderRadius: 18,
              background: "#f8fbff",
              border: "1px solid #dbeafe",
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              Amount to pay
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 30,
                fontWeight: 950,
                color: "#0f172a",
                lineHeight: 1,
              }}
            >
              ₱{Number(total).toLocaleString()}
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 14,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "10px 12px",
              fontSize: 12,
              color: "#1e40af",
              fontWeight: 700,
            }}
          >
            Demo only. No real GCash transaction will be made.
          </div>

          <div style={{ marginTop: 18 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 800,
                color: "#334155",
              }}
            >
              GCash mobile number
            </label>

            <input
              type="text"
              value={contact}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d+]/g, "").slice(0, 13);
                setContact(value);
                if (error) setError("");
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="09XXXXXXXXX or 639XXXXXXXXX"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "15px 16px",
                borderRadius: 16,
                border: error
                  ? "1.5px solid #ef4444"
                  : focused
                  ? "1.5px solid #2563eb"
                  : "1.5px solid #cbd5e1",
                boxShadow: focused && !error ? "0 0 0 4px rgba(37,99,235,0.12)" : "none",
                outline: "none",
                fontSize: 18,
                fontWeight: 800,
                color: "#0f172a",
                background: "#fff",
                transition: "0.15s ease",
              }}
            />

            <div
              style={{
                marginTop: 8,
                minHeight: 18,
                fontSize: 12,
                fontWeight: 700,
                color: error
                  ? "#ef4444"
                  : isValid && contact
                  ? "#16a34a"
                  : "#64748b",
              }}
            >
              {error
                ? error
                : isValid && contact
                ? "Valid GCash number"
                : "Use 09XXXXXXXXX, 639XXXXXXXXX, or +639XXXXXXXXX"}
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button
              onClick={handlePay}
              disabled={loading || !isValid}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: 16,
                border: "none",
                background:
                  loading || !isValid
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #0057ff, #00a8ff)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 900,
                cursor: loading || !isValid ? "not-allowed" : "pointer",
                boxShadow:
                  loading || !isValid
                    ? "none"
                    : "0 16px 30px rgba(0,87,255,0.28)",
              }}
            >
              {loading ? "Processing..." : "Pay with GCash"}
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: "14px 18px",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#fff",
                color: "#0f172a",
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FakeGCashModal;