import React from "react";
import axios from "axios";

function OrdersTab({
  salesHistory,
  products,
  cart,
  setCart,
  setActiveTab,
  setShowCartModal,
  setCancelModalVisible,
  setSaleToCancel,
  setCancelReason,
  enrichSalesWithImages,
  setSalesHistory,
  user,
}) {
  const formatCurrency = (amount) =>
    `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getStatusStyle = (status) => {
    switch (status) {
      case "cancelled":
        return { background: "#ffecec", color: "#e74c3c" };
      case "processing":
        return { background: "#fff3cd", color: "#e67e22" };
      case "to receive":
        return { background: "#e6f4ff", color: "#007bff" };
      case "completed":
        return { background: "#e9f9ee", color: "#2ecc71" };
      default:
        return { background: "#f0f0f0", color: "#555" };
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>📜 Order History</h3>

      {salesHistory.map((sale) => {
        const total = sale.items.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity),
          0
        );

        return (
          <div
            key={sale.saleId || sale.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "1.2rem",
              marginBottom: "1.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            {/* Order Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div>
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>
                  🧾 Order #{sale.saleId || sale.id}
                </span>
                <div
                  style={{
                    marginTop: "0.35rem",
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    ...getStatusStyle(sale.status),
                  }}
                >
                  {sale.status === "cancelled" && "❌ Cancelled"}
                  {sale.status === "processing" && "⏳ Processing"}
                  {sale.status === "to receive" && "📦 To Receive"}
                  {sale.status === "completed" && "✅ Completed"}
                </div>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#666" }}>
                {new Date(sale.created_at).toLocaleString()}
              </span>
            </div>

            {/* Items List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {sale.items.map((item, i) => {
                const product = products.find(
                  (p) => p?.name?.toLowerCase() === item?.name?.toLowerCase()
                );
                const variant =
                  product?.variants?.find(
                    (v) =>
                      String(v.id) === String(item.variantId || item.variant_id) ||
                      v.variant_name === item.variantName ||
                      v.variant_name === item.variant_name
                  ) || null;

                // const imageSrc =
                //   item.variantImage ||
                //   item.image ||
                //   item.variant_image ||
                //   variant?.images?.[0] ||
                //   product?.image;
                const imageSrc =
                  item.variant_image ||
                  item.product_image ||
                  null;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      border: "1px solid #f2f2f2",
                      borderRadius: "8px",
                      padding: "0.6rem",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #eee",
                        borderRadius: "6px",
                        flexShrink: 0,
                      }}
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.variantName || item.variant_name || item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                          No Image
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600" }}>
                        {item.product_name}
                      </div>
                      {(item.variantName || item.variant_name) && (
                        <div style={{ fontSize: "0.8rem", color: "#555" }}>
                          Variant: {item.variantName || item.variant_name}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", minWidth: "110px" }}>
                      <div style={{ fontSize: "0.9rem", color: "#333" }}>
                        x{item.quantity}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#888" }}>
                        {formatCurrency(item.price)}
                      </div>
                      <div style={{ fontWeight: "600", marginTop: "2px" }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method */}
            <div style={{ marginTop: "1rem" }}>
              <span
                style={{
                  backgroundColor: "#e0f7fa",
                  color: "#007b8a",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                💳 Payment: {sale.payment_method}
              </span>
            </div>

            {/* Total */}
            <div
              style={{
                textAlign: "right",
                fontWeight: "bold",
                marginTop: "1rem",
                fontSize: "1rem",
              }}
            >
              Total: {formatCurrency(total)}
            </div>

            {/* Cancel Reason */}
            {sale.status === "cancelled" && sale.cancel_description && (
              <div
                style={{
                  backgroundColor: "#fff5f5",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  marginTop: "0.9rem",
                  border: "1px solid #ffd6d6",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <span style={{ color: "#e74c3c", fontSize: "1.2rem" }}>❌</span>
                  <span style={{ fontWeight: "600" }}>Order Cancelled</span>
                </div>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>
                  <strong>Reason:</strong> {sale.cancel_description}
                </p>
                {sale.cancelled_by_name && (
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
                    Cancelled by:{" "}
                    <strong>
                      {sale.cancelled_by_role === "admin"
                        ? "Admin"
                        : sale.cancelled_by_name}
                    </strong>
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.6rem",
                marginTop: "1rem",
              }}
            >
              {(sale.status === "completed" || sale.status === "cancelled") && (
                <button
                  onClick={() => {
                    if (!sale.items) return;

                    const updatedCart = [...cart];

                    sale.items.forEach((item) => {
                      const cartItem = {
                        id: item.productId || item.id,
                        name: item.name,
                        price: Number(item.price) || 0,
                        quantity: Number(item.quantity) || 1,
                        variantId: item.variantId || item.variant_id || null,
                        variantName: item.variantName || item.variant_name || null,
                        variantImage:
                          item.variantImage ||
                          item.variant_image ||
                          item.image ||
                          null,
                        image: item.image || null,
                      };

                      const existingIndex = updatedCart.findIndex(
                        (c) =>
                          c.id === cartItem.id &&
                          c.variantId === cartItem.variantId &&
                          c.variantName === cartItem.variantName
                      );

                      if (existingIndex >= 0) {
                        updatedCart[existingIndex] = {
                          ...updatedCart[existingIndex],
                          quantity:
                            updatedCart[existingIndex].quantity +
                            cartItem.quantity,
                        };
                      } else {
                        updatedCart.push(cartItem);
                      }
                    });

                    setCart(updatedCart);
                    setActiveTab("shop");
                    setShowCartModal(true);
                  }}
                  style={{
                    padding: "0.5rem 0.85rem",
                    backgroundColor: "#ff9800",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  🔁 Buy Again
                </button>
              )}

              {sale.status === "to receive" && (
                <button
                  onClick={async () => {
                    try {
                      await axios.put(
                        `https://capstone-backend-kiax.onrender.com/sales/${sale.id}/status`,
                        { status: "completed" }
                      );
                      const updated = await axios.get(
                        `https://capstone-backend-kiax.onrender.com/sales/user/${user.id}`
                      );
                      setSalesHistory(enrichSalesWithImages(updated.data, products));
                    } catch {
                      alert("Failed to mark as received");
                    }
                  }}
                  style={{
                    padding: "0.5rem 0.85rem",
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  📦 Order Received
                </button>
              )}

              {sale.status === "processing" && (
                <button
                  onClick={() => {
                    setSaleToCancel(sale);
                    setCancelReason("");
                    setCancelModalVisible(true);
                  }}
                  style={{
                    padding: "0.5rem 0.85rem",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ❌ Cancel Order
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrdersTab;
