import React from "react";
import { FaTrashAlt } from "react-icons/fa";

function CartModal({
  cart,
  updateCartQuantity,
  removeFromCart,
  setShowCartModal,
  setShowPaymentModal,
  formatCurrency,
  userId,
  onCheckout,
}) {
  const cartTotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectPayment = () => {
    if (setShowPaymentModal) {
      setShowPaymentModal(true);
    }
  };

  const handleCheckout = () => {
    const payload = {
      userId,
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        variantImage: item.variantImage || item.image || null,
      })),
    };

    if (onCheckout) {
      onCheckout(payload);
    } else if (setShowPaymentModal) {
      setShowPaymentModal(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setShowCartModal(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 96vw)",
          maxHeight: "88vh",
          borderRadius: 18,
          overflow: "hidden",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 22px 70px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.6)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(59,130,246,0.12)",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
              }}
            >
              🛒
            </div>

            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 16 }}>
                Shopping Cart
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {totalItems} item{totalItems !== 1 ? "s" : ""} •{" "}
                {formatCurrency(cartTotal)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCartModal(false)}
            aria-label="Close cart"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: "20px",
              color: "#0f172a",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: 16,
            overflowY: "auto",
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.9), rgba(255,255,255,0.9))",
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                padding: 18,
                borderRadius: 16,
                background: "rgba(255,255,255,0.8)",
                border: "1px dashed rgba(0,0,0,0.12)",
                textAlign: "center",
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              No items in cart.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.variantId || "default"}`}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 16,
                      overflow: "hidden",
                      background: "#f1f5f9",
                      border: "1px solid rgba(0,0,0,0.06)",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {item.variantImage || item.image ? (
                      <img
                        src={item.variantImage || item.image}
                        alt={item.variantName || item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        No image
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}{" "}
                      <span style={{ color: "#64748b", fontWeight: 800 }}>
                        {item.variantName &&
                        item.variantName !== item.name &&
                        item.variantName.toLowerCase() !== "original"
                          ? `(${item.variantName})`
                          : ""}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontWeight: 900, color: "#ef4444" }}>
                        {formatCurrency(item.price)}
                      </div>

                      <div style={{ color: "#94a3b8", fontWeight: 800 }}>•</div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          fontWeight: 800,
                        }}
                      >
                        Subtotal:{" "}
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: 6,
                          borderRadius: 14,
                          background: "rgba(241,245,249,0.9)",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.id,
                              item.quantity - 1,
                              item.variantId,
                              item.variantName
                            )
                          }
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 900,
                            color: "#0f172a",
                          }}
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQuantity(
                              item.id,
                              parseInt(e.target.value, 10),
                              item.variantId,
                              item.variantName
                            )
                          }
                          style={{
                            width: 56,
                            height: 34,
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.08)",
                            textAlign: "center",
                            fontWeight: 900,
                            outline: "none",
                            background: "#fff",
                          }}
                        />

                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.id,
                              item.quantity + 1,
                              item.variantId,
                              item.variantName
                            )
                          }
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 900,
                            color: "#0f172a",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.id, item.variantId, item.variantName)
                    }
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      border: "1px solid rgba(239,68,68,0.25)",
                      background: "rgba(239,68,68,0.10)",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                    title="Remove"
                    aria-label="Remove item"
                  >
                    <FaTrashAlt color="#ef4444" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div
            style={{
              padding: 16,
              borderTop: "1px solid rgba(0,0,0,0.06)",
              background: "rgba(255,255,255,0.92)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 950, color: "#0f172a" }}>
              Total:{" "}
              <span style={{ color: "#0f172a" }}>
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleSelectPayment}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(59,130,246,0.25)",
                  background: "rgba(59,130,246,0.10)",
                  color: "#2563eb",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                💳 Select Payment
              </button>

              <button
                onClick={handleCheckout}
                style={{
                  padding: "10px 16px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff",
                  fontWeight: 950,
                  cursor: "pointer",
                  boxShadow: "0 14px 30px rgba(34,197,94,0.25)",
                }}
              >
                ✅ Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;