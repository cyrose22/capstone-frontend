import React, { useEffect, useMemo, useState } from "react";

function OrdersTab({
  salesHistory = [],
  products = [],
  cart = [],
  setCart,
  setActiveTab,
  setShowCartModal,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  const formatCurrency = (amount) =>
    `₱${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const normalizeStatus = (status) => (status || "").toLowerCase().trim();

  const formatOrderId = (id) => String(id || 0).padStart(6, "0");

  const formatDateTime = (value) => {
    if (!value) return "No date available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString("en-PH");
  };

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

  const filteredSales = useMemo(() => {
    const sorted = [...salesHistory].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    if (statusFilter === "all") return sorted;

    return sorted.filter(
      (sale) => normalizeStatus(sale.status) === statusFilter
    );
  }, [salesHistory, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSales.length / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleBuyAgain = (sale) => {
    if (!sale?.items?.length) return;

    const updatedCart = [...cart];
    let hasAddedItem = false;

    sale.items.forEach((item) => {
      const product = products.find(
        (p) =>
          p?.name?.toLowerCase() === (item?.product_name || "").toLowerCase()
      );

      if (!product) return;

      const variant =
        product?.variants?.find(
          (v) =>
            String(v.id) === String(item.variantId || item.variant_id) ||
            v.variant_name === item.variantName ||
            v.variant_name === item.variant_name
        ) || null;

      if (!variant || Number(variant.quantity) <= 0) return;

      const availableQty = Number(variant.quantity) || 0;
      const requestedQty = Number(item.quantity) || 1;
      const finalQty = Math.min(requestedQty, availableQty);

      const imageSrc =
        variant?.images?.[0] ||
        variant?.image ||
        item.variant_image ||
        item.product_image ||
        product?.image ||
        null;

      const cartItem = {
        id: product.id,
        name: product.name,
        price: Number(variant.price ?? item.price) || 0,
        quantity: finalQty,
        variantId: variant.id,
        variantName: variant.variant_name,
        image: imageSrc,
        variantStock: availableQty,
      };

      const existingIndex = updatedCart.findIndex(
        (c) =>
          c.id === cartItem.id &&
          String(c.variantId) === String(cartItem.variantId)
      );

      if (existingIndex >= 0) {
        const currentQty = Number(updatedCart[existingIndex].quantity) || 0;
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: Math.min(currentQty + finalQty, availableQty),
        };
      } else {
        updatedCart.push(cartItem);
      }

      hasAddedItem = true;
    });

    if (!hasAddedItem) {
      alert("Selected items are out of stock.");
      return;
    }

    setCart(updatedCart);
    setActiveTab("shop");
    setShowCartModal(true);
  };

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

      {currentSales.length === 0 ? (
        <div className="orders-empty">No orders in this category.</div>
      ) : (
        <div className="orders-grid">
          {currentSales.map((sale) => {
            const items = sale.items || [];

            const total =
              sale.total ??
              items.reduce(
                (sum, item) =>
                  sum + Number(item.price || 0) * Number(item.quantity || 0),
                0
              );

            const canBuyAgain = items.some((item) => {
              const product = products.find(
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

              return Number(variant?.quantity || 0) > 0;
            });

            return (
              <div key={sale.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <div className="order-card-topline">
                      <span className="order-id">
                        Order #{formatOrderId(sale.id)}
                      </span>
                      <span className={getStatusClass(sale.status)}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </div>

                    <div className="order-date">
                      {formatDateTime(sale.created_at)}
                    </div>
                  </div>

                  <div className="order-payment-pill">
                    💳 Payment: {sale.payment_method || "N/A"}
                  </div>
                </div>

                <div
                  className={`order-items ${items.length > 2 ? "scrollable" : ""}`}
                >
                  {items.map((item, i) => {
                    const product = products.find(
                      (p) =>
                        p?.name?.toLowerCase() ===
                        (item?.product_name || "").toLowerCase()
                    );

                    const variant =
                      product?.variants?.find(
                        (v) =>
                          String(v.id) ===
                            String(item.variantId || item.variant_id) ||
                          v.variant_name === item.variantName ||
                          v.variant_name === item.variant_name
                      ) || null;

                    const imageSrc =
                      item.variant_image ||
                      item.product_image ||
                      variant?.images?.[0] ||
                      variant?.image ||
                      product?.image ||
                      null;

                    const variantLabel =
                      item.variantName || item.variant_name || "";

                    const showVariant =
                      variantLabel &&
                      variantLabel !== item.product_name &&
                      variantLabel.toLowerCase() !== "original";

                    return (
                      <div key={`${sale.id}-${i}`} className="order-item-row">
                        <div className="order-item-image">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={
                                item.variantName ||
                                item.variant_name ||
                                item.product_name ||
                                "Product"
                              }
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>

                        <div className="order-item-main">
                          <div className="order-item-name">
                            {item.product_name}
                          </div>

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
                            Number(item.price || 0) * Number(item.quantity || 0)
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
                        disabled={!canBuyAgain}
                        onClick={() => handleBuyAgain(sale)}
                      >
                        {canBuyAgain ? "🔁 Buy Again" : "Out of Stock"}
                      </button>
                    )}
                  </div>
                </div>

                {normalizeStatus(sale.status) === "cancelled" &&
                  sale.cancel_description && (
                    <div className="order-cancel-box">
                      <div className="order-cancel-title">
                        ❌ Order Cancelled
                      </div>

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
      )}

      {filteredSales.length > 0 && (
        <div className="shop-pagination">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <button
                key={page}
                className={`shop-page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersTab;