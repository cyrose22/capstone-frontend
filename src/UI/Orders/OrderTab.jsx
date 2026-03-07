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

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "processing") return "order-status processing";
    if (normalized === "to receive") return "order-status to-receive";
    if (normalized === "completed") return "order-status completed";
    if (normalized === "cancelled") return "order-status cancelled";
    return "order-status";
  };

  const tabs = [
    { label: "All", value: "all" },
    { label: "Processing", value: "processing" },
    { label: "To Receive", value: "to receive" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="orders-wrap">
      <h3 className="orders-title">📜 Order History</h3>

      <div className="orders-filters">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`orders-filter-btn ${isActive ? "active" : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filteredSales.length === 0 && (
        <div className="orders-empty">
          No orders in this category.
        </div>
      )}

      {filteredSales.map((sale) => {
        const items = sale.items || [];
        const total =
          sale.total ??
          items.reduce(
            (sum, item) =>
              sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
          );

        return (
          <div key={sale.id} className="order-card">
            <div className="order-card-header">
              <div>
                <div className="order-card-topline">
                  <span className="order-id">Order #{sale.id}</span>
                  <span className={getStatusClass(sale.status)}>
                    {getStatusLabel(sale.status)}
                  </span>
                </div>

                <div className="order-date">
                  {new Date(sale.created_at).toLocaleString()}
                </div>
              </div>

              <div className="order-payment-pill">
                💳 Payment: {sale.payment_method || "N/A"}
              </div>
            </div>

            <div className="order-items">
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
                  <div key={i} className="order-item-row">
                    <div className="order-item-image">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={
                            item.variantName ||
                            item.variant_name ||
                            item.product_name
                          }
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>

                    <div className="order-item-main">
                      <div className="order-item-name">{item.product_name}</div>

                      {showVariant && (
                        <div className="order-item-variant">
                          Variant: {variantLabel}
                        </div>
                      )}

                      <div className="order-item-meta">
                        <span>x{item.quantity}</span>
                        <span>•</span>
                        <span>{formatCurrency(item.price)}</span>
                      </div>
                    </div>

                    <div className="order-item-total">
                      {formatCurrency(
                        Number(item.price) * Number(item.quantity)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-footer">
              <div className="order-grand-total">
                Total: {formatCurrency(total)}
              </div>

              <div className="order-actions">
                {(normalizeStatus(sale.status) === "completed" ||
                  normalizeStatus(sale.status) === "cancelled") && (
                  <button
                    className="order-btn order-btn-buy"
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
                          variantName:
                            item.variantName || item.variant_name || null,
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
                  >
                    🔁 Buy Again
                  </button>
                )}

                {normalizeStatus(sale.status) === "to receive" && (
                  <button
                    className="order-btn order-btn-receive"
                    onClick={async () => {
                      try {
                        await axios.put(
                          `https://capstone-backend-kiax.onrender.com/sales/${sale.id}/status`,
                          { status: "completed" }
                        );

                        const updated = await axios.get(
                          `https://capstone-backend-kiax.onrender.com/sales/user/${user.id}`
                        );

                        setSalesHistory(
                          enrichSalesWithImages(updated.data, products)
                        );
                      } catch {
                        alert("Failed to mark as received");
                      }
                    }}
                  >
                    📦 Order Received
                  </button>
                )}

                {normalizeStatus(sale.status) === "processing" && (
                  <button
                    className="order-btn order-btn-cancel"
                    onClick={() => {
                      setSaleToCancel(sale);
                      setCancelReason("");
                      setCancelModalVisible(true);
                    }}
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            </div>

            {normalizeStatus(sale.status) === "cancelled" &&
              sale.cancel_description && (
                <div className="order-cancel-box">
                  <div className="order-cancel-title">❌ Order Cancelled</div>

                  <p>
                    <strong>Reason:</strong> {sale.cancel_description}
                  </p>

                  {sale.cancelled_by_name && (
                    <p className="order-cancel-meta">
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
          </div>
        );
      })}
    </div>
  );
}

export default OrdersTab;