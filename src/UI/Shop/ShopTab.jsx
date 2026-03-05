import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import VariantModal from "../Variant/VariantModal"; // ✅ import reusable modal

function ShopTab({ addToCart, selectedCategory, setSelectedCategory }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedCategory, setSelectedCategory] = useState("All");
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
        selectedCategory === "All" || (p.category || "Others") === selectedCategory;

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
      <div className="shop-search">
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

      {/* 🛍 Product grid */}
      {Object.entries(
        currentProducts.reduce((groups, product) => {
          const cat = product.category || "Others";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(product);
          return groups;
        }, {})
      ).map(([category, items]) => (
        <div key={category} className="shop-section">
          <div className="shop-section-header">
            <h3>{category}</h3>
            <div className="shop-section-line" />
          </div>

          <div className="shop-grid">
            {items.map((p) => {
              const img =
                p?.variants?.[0]?.images?.[0] ? p.variants[0].images[0] : p.image ?? "";

              return (
                <div key={p.id} className="product-card">
                  {/* Badge */}
                  {p.displayQuantity <= 0 && (
                    <span className="product-badge">Sold out</span>
                  )}

                  {/* Image */}
                  <div className="product-image-wrap">
                    {img ? <img src={img} alt={p.name} className="product-image" /> : null}
                  </div>

                  {/* Info */}
                  <div className="product-info">
                    <h4 className="product-title">{p.name}</h4>
                    <div className="product-price">{formatCurrency(p.displayPrice)}</div>

                    {/* Stock bar */}
                    <div className="stock-wrap">
                      <div className="stock-bar">
                        <div
                          className={`stock-fill ${p.displayQuantity > 0 ? "in" : "out"}`}
                          style={{
                            width: `${
                              p.displayQuantity > 0
                                ? Math.min(100, (p.displayQuantity / 20) * 100)
                                : 8
                            }%`,
                          }}
                        />
                      </div>
                      <div className={`stock-text ${p.displayQuantity > 0 ? "in" : "out"}`}>
                        {p.displayQuantity > 0 ? `Stock: ${p.displayQuantity}` : "Out of stock"}
                      </div>
                    </div>

                    {/* Buttons */}
                    {p.hasVariants ? (
                      <button
                        className="product-btn"
                        disabled={p.displayQuantity <= 0}
                        onClick={() => openVariantModal(p, 0)}
                      >
                        View Variants
                      </button>
                    ) : (
                      <button
                        className="product-btn"
                        disabled={p.displayQuantity <= 0}
                        onClick={() => handleAddToCart(p)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
