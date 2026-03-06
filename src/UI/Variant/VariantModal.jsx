import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function VariantModal({
  product,
  currentIndex,
  setCurrentIndex,
  onClose,
  addToCart,
}) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(
    currentIndex || 0
  );

  useEffect(() => {
    setSelectedVariantIndex(currentIndex || 0);
  }, [currentIndex]);

  if (!product || !product.variants || product.variants.length === 0) {
    return null;
  }

  const variants = product.variants;
  const variant = variants[selectedVariantIndex];
  const stockQty = Number(variant?.quantity || 0);

  const formatCurrency = (amount) =>
    `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const prevVariant = () => {
    const nextIndex =
      (selectedVariantIndex - 1 + variants.length) % variants.length;
    setSelectedVariantIndex(nextIndex);
    setCurrentIndex(nextIndex);
  };

  const nextVariant = () => {
    const nextIndex = (selectedVariantIndex + 1) % variants.length;
    setSelectedVariantIndex(nextIndex);
    setCurrentIndex(nextIndex);
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

  const imageSrc = variant.images?.[0] || product.image || "";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          backgroundColor: "#fff",
          padding: "24px 24px 20px",
          borderRadius: "22px",
          maxWidth: "430px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(17,24,39,0.22)",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "38px",
            height: "38px",
            borderRadius: "999px",
            background: "#f8fafc",
            border: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* Product Name */}
        <h4
          style={{
            margin: "6px 0 16px",
            fontSize: "1.15rem",
            fontWeight: "700",
            color: "#2f2f2f",
            lineHeight: "1.35",
            padding: "0 22px",
          }}
        >
          {product.name}
        </h4>

        {/* Out of Stock Badge */}
        {stockQty <= 0 && (
          <span
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              background: "#fef2f2",
              color: "#dc2626",
              padding: "6px 10px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: "700",
            }}
          >
            Out of Stock
          </span>
        )}

        {/* Variant Image */}
        <div
          style={{
            width: "100%",
            height: "250px",
            overflow: "hidden",
            borderRadius: "18px",
            marginBottom: "16px",
            background: "#fafafa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={variant.variant_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "14px",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          ) : (
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>No Image</div>
          )}
        </div>

        {/* Variant Info */}
        <p
          style={{
            margin: "0 0 6px",
            fontWeight: "700",
            fontSize: "1.05rem",
            color: "#374151",
          }}
        >
          {variant.variant_name}
        </p>

        <p
          style={{
            margin: "0",
            color: "#e74c3c",
            fontWeight: "900",
            fontSize: "1.5rem",
          }}
        >
          {formatCurrency(variant.price)}
        </p>

        {/* Stock pill */}
        <div style={{ marginTop: "12px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 12px",
              borderRadius: "999px",
              fontSize: "0.92rem",
              fontWeight: "800",
              background: stockQty > 0 ? "#ecfdf3" : "#fef2f2",
              color: stockQty > 0 ? "#16a34a" : "#dc2626",
            }}
          >
            {stockQty > 0 ? `${stockQty} in stock` : "Out of stock"}
          </span>
        </div>

        {/* Variant dots */}
        {variants.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            {variants.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedVariantIndex(idx);
                  setCurrentIndex(idx);
                }}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  border: "none",
                  background: idx === selectedVariantIndex ? "#ee4d2d" : "#d1d5db",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        )}

        {/* Navigation + Add to Cart */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 48px",
            gap: "12px",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <button
            onClick={prevVariant}
            disabled={variants.length <= 1}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "999px",
              width: "48px",
              height: "48px",
              cursor: variants.length <= 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: variants.length <= 1 ? 0.4 : 1,
            }}
          >
            <FiChevronLeft size={22} />
          </button>

          <div
            style={{
              width: "100%",
              height: "240px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
              borderRadius: "14px",
            }}
          >
            <img
              src={variant.images?.[0] ?? ""}
              alt={variant.variant_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <button
            onClick={nextVariant}
            disabled={variants.length <= 1}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "999px",
              width: "48px",
              height: "48px",
              cursor: variants.length <= 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: variants.length <= 1 ? 0.4 : 1,
            }}
          >
            <FiChevronRight size={22} />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={stockQty <= 0}
          style={{
            marginTop: "18px",
            width: "100%",
            height: "48px",
            background:
              stockQty > 0
                ? "linear-gradient(45deg, #ff4e50, #f9d423)"
                : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: stockQty > 0 ? "pointer" : "not-allowed",
          }}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}

export default VariantModal;