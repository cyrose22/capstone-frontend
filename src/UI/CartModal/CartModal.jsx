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

    if (onCheckout) onCheckout(payload);
    else setShowPaymentModal(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "1rem",
          width: "90%",
          maxWidth: "520px",
          maxHeight: "90%",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        }}
      >
        {/* Close button */}
        <span
          style={{
            position: "absolute",
            top: "0.75rem", right: "1rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#555",
          }}
          onClick={() => setShowCartModal(false)}
        >
          ×
        </span>

        <h3 style={{ marginBottom: "1.2rem" }}>
          🛒 Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </h3>

        {cart.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>No items in cart.</p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.variantId || "default"}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Product/variant image */}
                  <div style={{ width: "60px", height: "60px", flexShrink: 0 }}>
                    {item.variantImage || item.image ? (
                      <img
                        src={item.variantImage || item.image}
                        alt={item.variantName || item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#f7f7f7",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "0.75rem",
                          color: "#999",
                          borderRadius: "8px",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Item details */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.3rem 0", fontSize: "1rem" }}>
                      {item.name}{" "}
                      {item.variantName ? `(${item.variantName})` : ""}
                    </h4>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#e74c3c", fontWeight: "bold" }}>
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>

                    {/* Quantity controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.id, item.quantity - 1, item.variantId, item.variantName)
                        }
                        style={{
                          padding: "0.3rem 0.6rem",
                          border: "1px solid #ccc",
                          backgroundColor: "#fff",
                          borderRadius: "6px",
                          cursor: "pointer",
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
                            parseInt(e.target.value),
                            item.variantId,
                            item.variantName
                          )
                        }
                        style={{
                          width: "50px",
                          textAlign: "center",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                          padding: "0.25rem",
                        }}
                      />
                      <button
                        onClick={() =>
                          updateCartQuantity(item.id, item.quantity + 1, item.variantId, item.variantName)
                        }
                        style={{
                          padding: "0.3rem 0.6rem",
                          border: "1px solid #ccc",
                          backgroundColor: "#fff",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.variantId, item.variantName)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrashAlt color="#f44336" size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Payment + Checkout */}
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  backgroundColor: "#2196F3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                💳 Select Payment Method
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "0.5rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #eee",
              }}
            >
              <strong style={{ fontSize: "1.1rem" }}>Total: {formatCurrency(cartTotal)}</strong>
              <button
                onClick={handleCheckout}
                style={{
                  padding: "0.6rem 1.2rem",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✅ Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal;
