import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import VariantModal from "../Variant/VariantModal"; // ✅ import reusable modal

function ShopTab({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Variant modal state
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);

  // helpers
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const formatCurrency = (amount) =>
    `₱${toNumber(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // fetch + normalize
  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://capstone-backend-kiax.onrender.com/products");
      const normalized = (res.data || []).map((p) => {
        const variants = Array.isArray(p.variants) ? p.variants : [];

        const finalVariants = variants.length
          ? variants.map((v, idx) => ({
              ...v,
              id: v.id ?? `${p.id}-variant-${idx}`,
              images: v.image ? [v.image] : [],
            }))
          : [
              {
                id: `original-${p.id}`,
                variant_name: "Original",
                price: p.price,
                quantity: toNumber(p.quantity),
                images: p.image ? [p.image] : [],
              },
            ];
        const hasVariants = finalVariants.length > 0;

        const displayPrice = finalVariants.length
          ? toNumber(finalVariants[0].price)
          : 0;

        const displayQuantity = finalVariants.reduce(
          (sum, v) => sum + toNumber(v.quantity ?? 0),
          0
        );

        return {
          ...p,
          variants: finalVariants,
          hasVariants,
          displayPrice,
          displayQuantity,
        };
      });

      setProducts(normalized);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  // auto refresh + focus refresh
  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const onFocus = () => fetchProducts();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // categories from products
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category || "Others"))],
    [products]
  );

  // filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  // Open variant modal
  const openVariantModal = (product, startIndex = 0) => {
    setCurrentProduct(product);
    setCurrentVariantIndex(startIndex);
    setVariantModalOpen(true);
  };

  // ✅ Add-to-Cart helper for non-variant products
  const handleAddToCart = (product, variantIndex = 0) => {
    const variant = product.variants?.[variantIndex];
    addToCart({
      id: product.id,
      name: product.name,
      price: toNumber(variant?.price ?? product.price),
      quantity: 1,
      variantId: variant?.id ?? `original-${product.id}`,
      variantName: variant?.variant_name ?? "Original",
      variantImage: variant?.images?.[0] ?? product.image ?? null,
      image: product.image ?? null,
    });
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* 🔍 Search */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="🔍 Search products by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            fontSize: "1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            outline: "none",
          }}
        />
      </div>

      {/* 📌 Category filter */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: selectedCategory === cat ? "#fce4e4" : "#fff",
              color: selectedCategory === cat ? "#e74c3c" : "#333",
              fontWeight: selectedCategory === cat ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🛍 Product grid */}
      {Object.entries(
        currentProducts.reduce((groups, product) => {
          const cat = product.category || "Others";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(product);
          return groups;
        }, {})
      ).map(([category, items]) => (
        <div key={category} style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              borderBottom: "2px solid #eee",
              paddingBottom: "0.5rem",
            }}
          >
            {category}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            {items.map((p) => (
              <div
                key={p.id}
                style={{
                  position: "relative",
                  backgroundColor: "#fff",
                  border: "1px solid #f0f0f0",
                  borderRadius: "12px",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                }}
              >
                {/* 🏷 Badge */}
                {p.displayQuantity <= 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      background: "#e74c3c",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      zIndex: 2,
                    }}
                  >
                    Out of Stock
                  </span>
                )}

                {/* 📸 Product Image */}
                {p.image && (
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      marginBottom: "0.5rem",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <img
                      src={
                        p.variants && p.variants[0] && p.variants[0].images[0]
                          ? p.variants[0].images[0]
                          : p.image ?? ""
                      }
                      alt={p.name}
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
                )}

                {/* 🏷 Product Info */}
                <h4 style={{ margin: "0.25rem 0", fontSize: "1rem", fontWeight: "600" }}>
                  {p.name}
                </h4>
                <p style={{ margin: "0", color: "#e74c3c", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {formatCurrency(p.displayPrice)}
                </p>

                {/* 📊 Stock bar */}
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
                          p.displayQuantity > 0
                            ? Math.min(100, (p.displayQuantity / 20) * 100)
                            : 5
                        }%`,
                        background: p.displayQuantity > 0 ? "#27ae60" : "#e74c3c",
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
                      color: p.displayQuantity > 0 ? "#27ae60" : "#e74c3c",
                    }}
                  >
                    {p.displayQuantity > 0
                      ? `Stock: ${p.displayQuantity}`
                      : "Out of stock"}
                  </p>
                </div>
                {/* 🛒 Add-to-Cart or View Variants */}
                {p.hasVariants ? (
                  <button
                    onClick={() => openVariantModal(p, 0)}
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      background:
                        p.displayQuantity > 0
                          ? "linear-gradient(45deg, #ff4e50, #f9d423)"
                          : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      cursor: p.displayQuantity > 0 ? "pointer" : "not-allowed",
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    View Variants
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={p.displayQuantity <= 0}
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      background:
                        p.displayQuantity > 0
                          ? "linear-gradient(45deg, #ff4e50, #f9d423)"
                          : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      cursor: p.displayQuantity > 0 ? "pointer" : "not-allowed",
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination controls */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{
            padding: "0.4rem 0.75rem",
            border: "1px solid #ddd",
            background: currentPage === 1 ? "#f5f5f5" : "#fff",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            borderRadius: "6px",
          }}
        >
          Prev
        </button>
        <span style={{ alignSelf: "center" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: "0.4rem 0.75rem",
            border: "1px solid #ddd",
            background: currentPage === totalPages ? "#f5f5f5" : "#fff",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            borderRadius: "6px",
          }}
        >
          Next
        </button>
      </div>

      {/* ✅ Reusable Variant Modal */}
      {variantModalOpen && currentProduct && (
        <VariantModal
          product={currentProduct}
          currentIndex={currentVariantIndex}
          setCurrentIndex={setCurrentVariantIndex}
          onClose={() => setVariantModalOpen(false)}
          addToCart={addToCart}
        />
      )}
    </div>
  );
}

export default ShopTab;
