import React, { useState, useEffect } from "react";
import axios from "axios";
import "./product-dashboard.css";
import Header from "../Header/Header";

function ProductDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    variants: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://capstone-backend-kiax.onrender.com/products");
      const normalized = (res.data || []).map((p) => {
        const variants = (p.variants || []).map((v) => ({
          id: v.id,
          variantName: v.variant_name || "Original",
          price: parseFloat(v.price || 0),
          qty: v.quantity != null ? parseInt(v.quantity, 10) : 0,
          images: v.image ? [v.image] : [],
        }));

        if (variants.length === 0) {
          variants.push({
            id: null,
            variantName: "Original",
            price: parseFloat(p.price || 0),
            qty: p.quantity || 0,
            images: p.image ? [p.image] : [],
          });
        }

        return {
          ...p,
          price: variants[0].price || 0,
          image: (variants[0].images && variants[0].images[0]) || null,
          variants,
        };
      });

      setProducts(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handleChangePage = (page) => setCurrentPage(page);

  // Input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Variants handling
  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { variantName: "", qty: 0, images: [] },
      ],
    }));
  };

  const removeVariant = (index) => {
    const newVariants = [...form.variants];
    newVariants.splice(index, 1);
    setForm((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantNameChange = (index, value) => {
    const newVariants = [...form.variants];
    newVariants[index].variantName = value;
    setForm((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantQtyChange = (index, value) => {
    const newVariants = [...form.variants];
    newVariants[index].qty = parseInt(value, 10) || 0;
    setForm((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantImagesChange = (index, files) => {
    const newVariants = [...form.variants];
    const images = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        images.push(reader.result);
        if (images.length === files.length) {
          newVariants[index].images = images;
          setForm((prev) => ({ ...prev, variants: newVariants }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setForm((prev) => {
      const newVariants = [...(prev.variants || [])];
      newVariants[variantIndex].images.splice(imageIndex, 1);
      return { ...prev, variants: newVariants };
    });
  };

  // Save product
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, image, category, variants } = form;

    if (!name || price === "")
      return alert("Please fill all required fields");

    const normalizedVariants =
      variants && variants.length > 0
        ? variants
        : [
            {
              id: null,
              variantName: "Original",
              price: parseFloat(price),
              qty: 0,
              images: image ? [image] : [],
            },
          ];

    const mappedVariants = normalizedVariants.map((v) => ({
      id: v.id || null,
      variantName: v.variantName || "Original",
      price: parseFloat(v.price || price),
      qty: parseInt(v.qty, 10) || 0,
      images: v.images || [],
    }));

    try {
      if (editingId !== null) {
        await axios.put(`https://capstone-backend-kiax.onrender.com/products/${editingId}`, {
          name,
          price: parseFloat(price),
          image,
          category,
          variants: mappedVariants,
        });
        setEditingId(null);
      } else {
        const quantity =
          mappedVariants.length === 1 &&
          mappedVariants[0].variantName === "Original"
            ? mappedVariants[0].qty
            : 0;

        await axios.post("https://capstone-backend-kiax.onrender.com/products", {
          name,
          price: parseFloat(price),
          image,
          category,
          variants: mappedVariants,
          quantity,
        });
      }

      setForm({
        name: "",
        price: "",
        image: "",
        category: "",
        variants: [],
      });
      fetchProducts();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      image: product.image || "",
      category: product.category || "",
      variants: product.variants || [],
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`https://capstone-backend-kiax.onrender.com/products/${id}`);
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="product-dashboard">
      <Header title="🛍️ Product Dashboard" />

      <button
        className="add-product-btn"
        onClick={() => {
          setForm({
            name: "",
            price: "",
            image: "",
            category: "",
            variants: [],
          });
          setEditingId(null);
          setShowModal(true);
        }}
      >
        ➕ Add Product
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "620px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "20px",
              borderRadius: "12px",
              background: "#fff",
            }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h3>{editingId !== null ? "Update Product" : "Add New Product"}</h3>
            <form
              onSubmit={handleSubmit}
              className="modal-form"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
              />

              <label>Price *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
              />

              <label>Display Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
              />
              {form.image && (
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    marginTop: "8px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#fafafa",
                  }}
                >
                  <img
                    src={form.image}
                    alt="Main product"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // ✅ keeps proportions
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4>Variants</h4>
                <button
                  type="button"
                  className="add-product-btn"
                  onClick={addVariant}
                >
                  + Add Variant
                </button>
              </div>

              {form.variants.length === 0 && <p>No variants added.</p>}
              {form.variants.map((variant, idx) => (
                <div
                  key={variant.id || idx}
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    background: "#fafafa",
                  }}
                >
                  <label>Variant Name</label>
                  <input
                    type="text"
                    value={variant.variantName}
                    onChange={(e) =>
                      handleVariantNameChange(idx, e.target.value)
                    }
                    required
                  />

                  <label>Variant Stock</label>
                  <input
                    type="number"
                    value={variant.qty || 0}
                    min="0"
                    onChange={(e) =>
                      handleVariantQtyChange(idx, e.target.value)
                    }
                  />
                  <p
                    style={{
                      fontSize: "0.9em",
                      color: variant.qty <= 0 ? "red" : "green",
                    }}
                  >
                    {variant.qty > 0
                      ? `${variant.qty} in stock`
                      : "Out of Stock"}
                  </p>

                  <label>Variant Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleVariantImagesChange(idx, e.target.files)
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginTop: "8px",
                    }}
                  >
                    {variant.images &&
                      variant.images.map((img, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img
                            src={img}
                            alt=""
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(idx, i)}
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              background: "#e74c3c",
                              border: "none",
                              borderRadius: "50%",
                              color: "white",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Remove Variant
                  </button>
                </div>
              ))}

              <div className="modal-actions">
                <button type="submit">
                  {editingId !== null ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="product-grid">
        {products.length === 0 ? (
          <p className="empty-message">No products yet.</p>
        ) : (
          paginatedProducts.map((p) => (
            <div key={p.id} className="product-card">
              <div
                className="product-image"
                style={{
                  width: "100%",
                  height: "160px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#fafafa",
                }}
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // ✅ fix stretch here too
                    }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h4>{p.name}</h4>
                <p>₱{parseFloat(p.price).toFixed(2)}</p>

                {p.variants && p.variants.length > 0 && (
                  <div style={{ marginTop: "6px" }}>
                    <strong>Variants:</strong>
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {p.variants.map((v, i) => (
                        <li key={i}>
                          {v.variantName} –{" "}
                          {v.qty > 0 ? (
                            <span style={{ color: "green" }}>
                              {v.qty} in stock
                            </span>
                          ) : (
                            <span style={{ color: "red" }}>
                              Out of Stock
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="product-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(p)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => handleChangePage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductDashboard;
