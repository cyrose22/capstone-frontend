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
  setToastMessage,
  setToastType,
  setShowToast,
}) {
  const cartTotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getAvailableStock = (item) => {
    const rawStock =
      item.variantStock ??
      item.stock ??
      item.quantity_available ??
      item.availableStock;

    if (rawStock === undefined || rawStock === null || rawStock === "") {
      return null;
    }

    const parsed = Number(rawStock);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const getItemLabel = (item) => {
    return item.variantName &&
      item.variantName !== item.name &&
      item.variantName.toLowerCase() !== "original"
      ? `${item.name} (${item.variantName})`
      : item.name || "Product";
  };

  const handleSelectPayment = () => {
    handleCheckout();
  };

  const handleCheckout = () => {
    const invalidItem = cart.find((item) => {
      const availableStock = getAvailableStock(item);
      if (availableStock === null) return false;
      return Number(item.quantity || 0) > availableStock;
    });

    if (invalidItem) {
      const availableStock = getAvailableStock(invalidItem);

      if (setToastType) setToastType("error");
      if (setToastMessage) {
        setToastMessage(
          `❌ Not enough stock for ${getItemLabel(
            invalidItem
          )}. Only ${availableStock} left in stock.`
        );
      }
      if (setShowToast) setShowToast(true);
      return;
    }

    if (setShowPaymentModal) {
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
          width: "min(760px, 96vw)",
          maxHeight: "88vh",
          borderRadius: 20,
          overflow: "hidden",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 22px 70px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.6)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            background: "#fff",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🛒
            </div>

            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 17 }}>
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
              flexShrink: 0,
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
              "linear-gradient(180deg, rgba(248,250,252,0.92), rgba(255,255,255,0.96))",
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                padding: 18,
                borderRadius: 16,
                background: "rgba(255,255,255,0.85)",
                border: "1px dashed rgba(0,0,0,0.12)",
                textAlign: "center",
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              No items in cart.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cart.map((item) => {
                const availableStock = getAvailableStock(item);
                const isOverStock =
                  availableStock !== null &&
                  Number(item.quantity || 0) > availableStock;

                const isAtMaxStock =
                  availableStock !== null &&
                  Number(item.quantity || 0) >= availableStock;

                return (
                  <div
                    key={`${item.id}-${item.variantId || "default"}`}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      padding: 14,
                      borderRadius: 18,
                      background: "#fff",
                      border: isOverStock
                        ? "1px solid rgba(239,68,68,0.30)"
                        : "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: 16,
                        overflow: "hidden",
                        background: "#f8fafc",
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
                          fontSize: 15,
                          lineHeight: 1.25,
                          wordBreak: "break-word",
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
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: "#ef4444" }}>
                          {formatCurrency(item.price)}
                        </div>

                        <div style={{ color: "#94a3b8", fontWeight: 800 }}>
                          •
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            fontWeight: 700,
                          }}
                        >
                          Subtotal:{" "}
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          color:
                            availableStock === null
                              ? "#f59e0b"
                              : isOverStock
                              ? "#dc2626"
                              : "#16a34a",
                        }}
                      >
                        {availableStock === null
                          ? "Stock unavailable"
                          : `${availableStock} available`}
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: 6,
                            borderRadius: 16,
                            background: "#f1f5f9",
                            border: "1px solid rgba(0,0,0,0.05)",
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
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              border: "1px solid rgba(0,0,0,0.06)",
                              background: "#fff",
                              cursor: "pointer",
                              fontWeight: 900,
                              color: "#0f172a",
                              fontSize: 18,
                            }}
                          >
                            −
                          </button>

                          <div
                            style={{
                              minWidth: 44,
                              height: 36,
                              padding: "0 10px",
                              borderRadius: 12,
                              border: "1px solid rgba(0,0,0,0.06)",
                              background: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 900,
                              color: "#0f172a",
                            }}
                          >
                            {item.quantity}
                          </div>

                          <button
                            disabled={isAtMaxStock}
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.quantity + 1,
                                item.variantId,
                                item.variantName
                              )
                            }
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              border: "1px solid rgba(0,0,0,0.06)",
                              background: isAtMaxStock ? "#e5e7eb" : "#fff",
                              cursor: isAtMaxStock ? "not-allowed" : "pointer",
                              fontWeight: 900,
                              color: "#0f172a",
                              opacity: isAtMaxStock ? 0.6 : 1,
                              fontSize: 18,
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {isOverStock && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#dc2626",
                          }}
                        >
                          Quantity exceeds available stock.
                        </div>
                      )}

                      {!isOverStock && isAtMaxStock && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#f59e0b",
                          }}
                        >
                          Stock limit reached.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.variantId, item.variantName)
                      }
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        border: "1px solid rgba(239,68,68,0.25)",
                        background: "rgba(239,68,68,0.08)",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                      title="Remove"
                      aria-label="Remove item"
                    >
                      <FaTrashAlt color="#ef4444" size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div
            style={{
              padding: 16,
              borderTop: "1px solid rgba(0,0,0,0.06)",
              background: "rgba(255,255,255,0.96)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontWeight: 950,
                color: "#0f172a",
                fontSize: 16,
              }}
            >
              Total:{" "}
              <span style={{ color: "#0f172a" }}>
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleSelectPayment}
                style={{
                  padding: "11px 16px",
                  borderRadius: 14,
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid rgba(0,0,0,0.10)",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                💳 Select Payment
              </button>

              <button
                onClick={handleCheckout}
                style={{
                  padding: "11px 18px",
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