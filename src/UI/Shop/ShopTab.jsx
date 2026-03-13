import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import VariantModal from "../Variant/VariantModal";

function ShopTab({ addToCart, selectedCategory, setSelectedCategory }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
      const res = await axios.get(
        "https://capstone-backend-kiax.onrender.com/products"
      );

      const normalized = (res.data || []).map((p) => {
        const variants = Array.isArray(p.variants) ? p.variants : [];

        const finalVariants = variants.length
          ? variants.map((v, idx) => ({
              ...v,
              id: Number(v.id ?? `${p.id}${idx}`),
              image: v.image || null,
              images: v.image ? [v.image] : [],
              price: toNumber(v.price),
              quantity: toNumber(v.quantity),
            }))
          : [
              {
                id: `original-${p.id}`,
                variant_name: p.name,
                price: p.price,
                quantity: toNumber(p.quantity),
                images: p.image ? [p.image] : [],
              },
            ];

        const hasVariants = variants.length > 0;

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
        selectedCategory === "All" ||
        (p.category || "Others") === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  // Open variant modal
  const openVariantModal = (product, startIndex = 0) => {
    setCurrentProduct(product);
    setCurrentVariantIndex(startIndex);
    setVariantModalOpen(true);
  };

  // Add-to-Cart helper for non-variant products
  const handleAddToCart = (product, variantIndex = 0) => {
    const variant = product.variants?.[variantIndex] || null;

    addToCart(product, {
      variantId: variant?.id ?? null,
      variantName: variant?.variant_name ?? product.name,
      variantImage: variant?.image ?? product.image ?? null,
      price: toNumber(variant?.price ?? product.price),
    });
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* Search */}
      <div className="shop-search">
        <input
          type="text"
          className="shop-search-input"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Optional local category pills if you want to use them later */}
      {categories.length > 0 && (
        <div style={{ display: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Category Result Header */}
      <div className="shop-results-header">
        <h2 className="shop-results-title">
          {selectedCategory === "All" ? "All Products" : selectedCategory} 
          <span>
            ({filteredProducts.length} item
            {filteredProducts.length !== 1 ? "s" : ""})
          </span>
        </h2>
      </div>

      {/* Product grid */}
      <div className="shop-grid">
        {currentProducts.length === 0 ? (
          <div className="shop-empty-state">
            <h3>No products found</h3>
            <p>Try another search or category.</p>
          </div>
        ) : (
          currentProducts.map((p) => {
            const imageSrc =
              p.variants?.[0]?.images?.[0] || p.image || "";

            return (
              <article
                key={p.id}
                className="shop-card"
                onClick={() => openVariantModal(p, 0)}
                style={{ cursor: "pointer" }}
              >
                {p.displayQuantity <= 0 && (
                  <span className="shop-stock-badge out">Out of Stock</span>
                )}

                <div
                  className="shop-card-image"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.hasVariants ? openVariantModal(p, 0) : handleAddToCart(p);
                  }}
                  style={{
                    cursor: p.displayQuantity > 0 ? "pointer" : "default",
                  }}
                >
                  {imageSrc ? (
                    <img src={imageSrc} alt={p.name} />
                  ) : (
                    <div className="shop-card-no-image">No Image</div>
                  )}
                </div>

                <div className="shop-card-body">
                  <div className="shop-card-top">
                    <span className="shop-category-chip">
                      {p.category || "Others"}
                    </span>

                    <span
                      className={`shop-stock-chip ${
                        p.displayQuantity > 0 ? "in" : "out"
                      }`}
                    >
                      {p.displayQuantity > 0
                        ? `${p.displayQuantity} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  <h4 className="shop-card-title">{p.name}</h4>
                  <p className="shop-card-price">
                    {formatCurrency(p.displayPrice)}
                  </p>

                  <p className="shop-card-meta">
                    {p.variants?.length > 1 ? `${p.variants.length} variants available` : ""}
                  </p>

                  <button
                    className="shop-card-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      p.hasVariants ? openVariantModal(p, 0) : handleAddToCart(p);
                    }}
                    disabled={p.displayQuantity <= 0}
                  >
                    🛒 {p.hasVariants ? "Choose Options" : "Add to Cart"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Pagination controls */}
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

      {/* Reusable Variant Modal */}
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