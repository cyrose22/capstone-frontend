import React, { useState } from "react";

function VariantModal({
  product,
  currentIndex,
  setCurrentIndex,
  onClose,
  addToCart,
}) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(currentIndex || 0);

  if (!product || !product.variants || product.variants.length === 0) {
    return null;
  }

  const variants = product.variants;
  const variant = variants[selectedVariantIndex];

  const formatCurrency = (amount) =>
    `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const prevVariant = () => {
    setSelectedVariantIndex(
      (prev) => (prev - 1 + variants.length) % variants.length
    );
    setCurrentIndex((prev) => (prev - 1 + variants.length) % variants.length);
  };

  const nextVariant = () => {
    setSelectedVariantIndex((prev) => (prev + 1) % variants.length);
    setCurrentIndex((prev) => (prev + 1) % variants.length);
  };

  const handleAddToCart = () => {
    if (!product || !variant) return;

    addToCart(product, {
      variantId: variant.id,
      variantName: variant.variant_name,
      variantImage: variant.images?.[0] || product.image,
      price: variant.price,
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "16px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {/* ❌ Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "12px",
            background: "transparent",
            border: "none",
            fontSize: "1.4rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#666",
          }}
        >
          ×
        </button>

        {/* Product Name */}
        <h4 style={{ marginBottom: "0.75rem", fontSize: "1.2rem", fontWeight: "600" }}>
          {product.name}
        </h4>

        {/* Out of Stock Badge */}
        {Number(variant.quantity) <= 0 && (
          <span
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              background: "#e74c3c",
              color: "#fff",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            Out of Stock
          </span>
        )}

        {/* Variant Image */}
        <div
          style={{
            width: "100%",
            height: "240px",
            overflow: "hidden",
            borderRadius: "10px",
            marginBottom: "0.75rem",
          }}
        >
          <img
            src={variant.images?.[0] ?? ""}
            alt={variant.variant_name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>

        {/* Variant Info */}
        <p style={{ margin: "0.25rem 0", fontWeight: "600", fontSize: "1rem" }}>
          {variant.variant_name}
        </p>
        <p style={{ margin: "0.25rem 0", color: "#e74c3c", fontWeight: "bold", fontSize: "1.1rem" }}>
          {formatCurrency(variant.price)}
        </p>

        {/* Stock with progress bar */}
        <div style={{ width: "100%", marginTop: "0.5rem" }}>
          <div
            style={{
              height: "6px",
              borderRadius: "4px",
              background: "#f0f0f0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${
                  Number(variant.quantity) > 0
                    ? Math.min(100, (variant.quantity / 20) * 100)
                    : 5 // always show a small red bar if 0
                }%`,
                background: Number(variant.quantity) > 0 ? "#27ae60" : "#e74c3c",
                height: "100%",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          <p
            style={{
              margin: "0.25rem 0",
              fontSize: "0.85rem",
              fontWeight: "bold",
              color: Number(variant.quantity) > 0 ? "#27ae60" : "#e74c3c",
            }}
          >
            Stock: {variant.quantity}
          </p>
        </div>
        {/* Navigation + Add to Cart */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={prevVariant}
            style={{
              background: "#f5f5f5",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            ⬅
          </button>

          <button
            onClick={handleAddToCart}
            disabled={Number(variant.quantity) <= 0}
            style={{
              background:
                Number(variant.quantity) > 0
                  ? "linear-gradient(45deg, #ff4e50, #f9d423)"
                  : "#ccc",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: Number(variant.quantity) > 0 ? "pointer" : "not-allowed",
              transition: "opacity 0.2s ease",
            }}
          >
            🛒 Add to Cart
          </button>

          <button
            onClick={nextVariant}
            style={{
              background: "#f5f5f5",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            ➡
          </button>
        </div>
      </div>
    </div>
  );
}

export default VariantModal;
