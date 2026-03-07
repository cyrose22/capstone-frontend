import React, { useMemo, useState } from "react";
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
  const [statusFilter, setStatusFilter] = useState("all");

  const formatCurrency = (amount) =>
    `₱${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const normalizeStatus = (status) => (status || "").toLowerCase().trim();

  const filteredSales = useMemo(() => {
    const allSales = salesHistory || [];
    if (statusFilter === "all") return allSales;
    return allSales.filter(
      (sale) => normalizeStatus(sale.status) === statusFilter
    );
  }, [salesHistory, statusFilter]);

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "processing") return "⏳ Processing";
    if (normalized === "to receive") return "📦 To Receive";
    if (normalized === "completed") return "✅ Completed";
    if (normalized === "cancelled") return "❌ Cancelled";
    return status || "Unknown";
  };

  const getStatusStyles = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "processing") {
      return {
        backgroundColor: "#fff7ed",
        color: "#ea580c",
      };
    }

    if (normalized === "to receive") {
      return {
        backgroundColor: "#eff6ff",
        color: "#2563eb",
      };
    }

    if (normalized === "completed") {
      return {
        backgroundColor: "#ecfdf3",
        color: "#16a34a",
      };
    }

    if (normalized === "cancelled") {
      return {
        backgroundColor: "#fef2f2",
        color: "#dc2626",
      };
    }

    return {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    };
  };

  const tabs = [
    { label: "All", value: "all" },
    { label: "Processing", value: "processing" },
    { label: "To Receive", value: "to receive" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div style={{ padding: "1rem" }}>
      <h3
        style={{
          marginBottom: "1rem",
          fontSize: "1.65rem",
          fontWeight: "800",
          color: "#1f2937",
        }}
      >
        📜 Order History
      </h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                border: isActive ? "none" : "1px solid #e5e7eb",
                background: isActive ? "#ff6b35" : "#ffffff",
                color: isActive ? "#fff" : "#111827",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: isActive
                  ? "0 10px 20px rgba(255,107,53,0.18)"
                  : "none",
                transition: "all 0.18s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filteredSales.length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #d1d5db",
            borderRadius: "18px",
            padding: "32px 20px",
            textAlign: "center",
            color: "#6b7280",
            fontWeight: "600",
          }}
        >
          No orders in this category.
        </div>
      )}

      {filteredSales.map((sale) => {
        const items = sale.items || [];
        const total =
          sale.total ??
          items.reduce(
            (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
          );

        return (
          <div
            key={sale.id}
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: "18px",
              padding: "1.2rem",
              marginBottom: "1.2rem",
              boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
              border: "1px solid rgba(15,23,42,0.06)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 18px 34px rgba(15,23,42,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 12px 28px rgba(15,23,42,0.08)";
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: "800", fontSize: "1rem", color: "#111827" }}>
                    Order #{sale.id}
                  </span>

                  <span
                    style={{
                      ...getStatusStyles(sale.status),
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "0.83rem",
                      fontWeight: "800",
                    }}
                  >
                    {getStatusLabel(sale.status)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  {new Date(sale.created_at).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#e0f7fa",
                  color: "#007b8a",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                }}
              >
                💳 Payment: {sale.payment_method || "N/A"}
              </div>
            </div>

            {/* Items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "1rem",
              }}
            >
              {items.map((item, i) => {
                const product = (products || []).find(
                  (p) =>
                    p?.name?.toLowerCase() ===
                    (item?.product_name || "").toLowerCase()
                );

                const variant =
                  product?.variants?.find(
                    (v) =>
                      String(v.id) === String(item.variantId || item.variant_id) ||
                      v.variant_name === item.variantName ||
                      v.variant_name === item.variant_name
                  ) || null;

                const imageSrc =
                  item.variant_image ||
                  item.product_image ||
                  variant?.images?.[0] ||
                  product?.image ||
                  null;

                const variantLabel = item.variantName || item.variant_name || "";
                const showVariant =
                  variantLabel &&
                  variantLabel !== item.product_name &&
                  variantLabel.toLowerCase() !== "original";

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      border: "1px solid #f1f5f9",
                      borderRadius: "14px",
                      padding: "0.75rem",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        width: "62px",
                        height: "62px",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #eee",
                        borderRadius: "10px",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.variantName || item.variant_name || item.product_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                          No Image
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#111827",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.product_name}
                      </div>

                      {showVariant && (
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          Variant: {variantLabel}
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
                      <div style={{ fontWeight: "700", marginTop: "2px" }}>
                        {formatCurrency(Number(item.price) * Number(item.quantity))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div
              style={{
                textAlign: "right",
                fontWeight: "800",
                marginTop: "1rem",
                fontSize: "1rem",
                color: "#111827",
              }}
            >
              Total: {formatCurrency(total)}
            </div>

            {/* Cancel Reason */}
            {normalizeStatus(sale.status) === "cancelled" &&
              sale.cancel_description && (
                <div
                  style={{
                    backgroundColor: "#fff5f5",
                    padding: "0.9rem",
                    borderRadius: "12px",
                    marginTop: "0.9rem",
                    border: "1px solid #ffd6d6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: "#e74c3c", fontSize: "1.1rem" }}>❌</span>
                    <span style={{ fontWeight: "700" }}>Order Cancelled</span>
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
                flexWrap: "wrap",
              }}
            >
              {(normalizeStatus(sale.status) === "completed" ||
                normalizeStatus(sale.status) === "cancelled") && (
                <button
                  onClick={() => {
                    if (!sale.items) return;

                    const updatedCart = [...cart];

                    sale.items.forEach((item) => {
                      const cartItem = {
                        id: item.product_id,
                        name: item.product_name,
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
                            updatedCart[existingIndex].quantity + cartItem.quantity,
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
                    padding: "0.6rem 0.9rem",
                    backgroundColor: "#ff9800",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  🔁 Buy Again
                </button>
              )}

              {normalizeStatus(sale.status) === "to receive" && (
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
                    padding: "0.6rem 0.9rem",
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  📦 Order Received
                </button>
              )}

              {normalizeStatus(sale.status) === "processing" && (
                <button
                  onClick={() => {
                    setSaleToCancel(sale);
                    setCancelReason("");
                    setCancelModalVisible(true);
                  }}
                  style={{
                    padding: "0.6rem 0.9rem",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
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