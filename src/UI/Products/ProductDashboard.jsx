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

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [showModal]);

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

      {/* ✅ Apply Sales-like topbar + container, keep your existing code intact */}
      <div className="page-container sd__container">
        <div className="sd__topbar">
          <div className="sd__topbarLeft">
            <h2 className="sd__title">Product Overview</h2>
            <p className="sd__subtitle">Manage products, prices, images and variants.</p>
          </div>

          <div className="sd__topbarRight">
            <button
              className="sd__btn sd__btn--primary"
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
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay sd__modalOverlay" onClick={() => setShowModal(false)}>
            <div className="modal-content sd__modal pd__modal" onClick={(e) => e.stopPropagation()}>
              <div className="sd__modalHeader">
                <h3>{editingId !== null ? "Update Product" : "Add New Product"}</h3>
                <button
                  className="sd__modalX"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* ✅ Scroll area */}
              <div className="pd__modalBody">
                <form id="productForm" onSubmit={handleSubmit} className="pd__form">
                  <div className="pd__grid2">
                    <div>
                      <label className="pd__label">Product Name *</label>
                      <input
                        className="pd__input"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="pd__label">Category</label>
                      <input
                        className="pd__input"
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="pd__label">Price *</label>
                      <input
                        className="pd__input"
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="pd__label">Display Image</label>
                      <input
                        className="pd__input"
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </div>
                  </div>

                  {/* ✅ Smaller preview */}
                  {form.image && (
                    <div className="pd__preview">
                      <img src={form.image} alt="Main product" />
                    </div>
                  )}

                  <div className="pd__variantsHead">
                    <h4 className="pd__variantsTitle">Variants</h4>
                    <button type="button" className="sd__btn" onClick={addVariant}>
                      + Add Variant
                    </button>
                  </div>

                  {form.variants.length === 0 && <p className="pd__muted">No variants added.</p>}

                  {form.variants.map((variant, idx) => (
                    <div key={variant.id || idx} className="pd__variantCard">
                      <div className="pd__variantTop">
                        <strong>Variant {idx + 1}</strong>
                        <button
                          type="button"
                          className="sd__btn sd__btn--danger"
                          onClick={() => removeVariant(idx)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="pd__grid2">
                        <div>
                          <label className="pd__label">Variant Name</label>
                          <input
                            className="pd__input"
                            type="text"
                            value={variant.variantName}
                            onChange={(e) => handleVariantNameChange(idx, e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="pd__label">Variant Stock</label>
                          <input
                            className="pd__input"
                            type="number"
                            value={variant.qty || 0}
                            min="0"
                            onChange={(e) => handleVariantQtyChange(idx, e.target.value)}
                          />
                          <div className={`pd__stock ${variant.qty > 0 ? "ok" : "bad"}`}>
                            {variant.qty > 0 ? `${variant.qty} in stock` : "Out of stock"}
                          </div>
                        </div>
                      </div>

                      <label className="pd__label">Variant Images</label>
                      <input
                        className="pd__input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleVariantImagesChange(idx, e.target.files)}
                      />

                      <div className="pd__thumbs">
                        {variant.images?.map((img, i) => (
                          <div key={i} className="pd__thumb">
                            <img src={img} alt="" />
                            <button
                              type="button"
                              className="pd__thumbX"
                              onClick={() => removeVariantImage(idx, i)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </form>
              </div>

              {/* ✅ Footer aligned, outside scroll */}
              <div className="pd__modalFooter">
                <button className="sd__btn" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="sd__btn sd__btn--primary" type="submit" form="productForm">
                  {editingId !== null ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="product-grid sales-card-list sd__grid pd__grid">
          {products.length === 0 ? (
            <p className="empty-message">No products yet.</p>
          ) : (
            paginatedProducts.map((p) => (
              <div key={p.id} className="product-card sales-card sd__card pd__card">
                <div className="product-image">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>

                <div className="product-info">
                  <h4>{p.name}</h4>
                  <p className="pd__price">₱{parseFloat(p.price).toFixed(2)}</p>

                  {p.variants && p.variants.length > 0 && (
                    <div style={{ marginTop: "6px" }}>
                      <strong>Variants:</strong>
                      <ul className="pd__variantsList">
                        {p.variants.map((v, i) => (
                          <li key={i}>
                            {v.variantName} –{" "}
                            {v.qty > 0 ? (
                              <span style={{ color: "#15803d", fontWeight: 900 }}>
                                {v.qty} in stock
                              </span>
                            ) : (
                              <span style={{ color: "#b91c1c", fontWeight: 900 }}>
                                Out of Stock
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="product-actions card-actions sd__actions">
                  <button className="sd__btn" onClick={() => handleEdit(p)}>
                    ✏️ Edit
                  </button>
                  <button className="sd__btn sd__btn--danger" onClick={() => handleDelete(p.id)}>
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
    </div>
  );
}

export default ProductDashboard;