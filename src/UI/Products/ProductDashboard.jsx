import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./product-dashboard.css";
import Header from "../Header/Header";

const API_URL = "https://capstone-backend-kiax.onrender.com/products";

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);

      const normalized = (res.data || []).map((p) => {
        const variants = (p.variants || []).map((v) => ({
          id: v.id || null,
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
            qty: p.quantity != null ? parseInt(p.quantity, 10) : 0,
            images: p.image ? [p.image] : [],
          });
        }

        return {
          ...p,
          price: variants[0]?.price || 0,
          image: variants[0]?.images?.[0] || p.image || "",
          variants,
        };
      });

      setProducts(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch products");
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return products.slice(indexOfFirst, indexOfLast);
  }, [products, currentPage]);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      image: "",
      category: "",
      variants: [],
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    setForm({
      name: "",
      price: "",
      image: "",
      category: "",
      variants: [
        {
          id: null,
          variantName: "Original",
          price: "",
          qty: 0,
          images: [],
        },
      ],
    });

    setEditingId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChangePage = (page) => setCurrentPage(page);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "price") {
        const updatedVariants = (prev.variants || []).map((variant) => ({
          ...variant,
          price: value,
        }));

        return {
          ...prev,
          price: value,
          variants: updatedVariants,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          id: null,
          variantName: "",
          price: prev.price ? parseFloat(prev.price) : "",
          qty: 0,
          images: [],
        },
      ],
    }));
  };

  const addPresetVariant = (name) => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          id: null,
          variantName: name,
          price: prev.price ? parseFloat(prev.price) : "",
          qty: 0,
          images: [],
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => {
      const nextVariants = [...(prev.variants || [])];
      nextVariants.splice(index, 1);
      return {
        ...prev,
        variants: nextVariants,
      };
    });
  };

  const updateVariantField = (index, field, value) => {
    setForm((prev) => {
      const nextVariants = [...(prev.variants || [])];
      nextVariants[index] = {
        ...nextVariants[index],
        [field]: value,
      };
      return {
        ...prev,
        variants: nextVariants,
      };
    });
  };

  const handleVariantImagesChange = (index, files) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    )
      .then((images) => {
        setForm((prev) => {
          const nextVariants = [...(prev.variants || [])];
          const currentImages = nextVariants[index]?.images || [];
          nextVariants[index] = {
            ...nextVariants[index],
            images: [...currentImages, ...images],
          };
          return {
            ...prev,
            variants: nextVariants,
          };
        });
      })
      .catch((err) => {
        console.error("Variant image upload error:", err);
        toast.error("Failed to load one or more images");
      });
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setForm((prev) => {
      const nextVariants = [...(prev.variants || [])];
      const nextImages = [...(nextVariants[variantIndex]?.images || [])];
      nextImages.splice(imageIndex, 1);

      nextVariants[variantIndex] = {
        ...nextVariants[variantIndex],
        images: nextImages,
      };

      return {
        ...prev,
        variants: nextVariants,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, price, image, category, variants } = form;

    if (!name.trim() || price === "") {
      toast.error("Please fill all required fields");
      return;
    }

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
      variantName: v.variantName?.trim() || "Original",
      price: parseFloat(v.price || price),
      qty: parseInt(v.qty, 10) || 0,
      images: v.images || [],
    }));

    const payload = {
      name: name.trim(),
      price: parseFloat(price),
      image,
      category: category.trim(),
      variants: mappedVariants,
    };

    try {
      const toastId = toast.loading(
        editingId !== null ? "Updating product..." : "Saving product..."
      );

      if (editingId !== null) {
        await axios.put(`${API_URL}/${editingId}`, payload);
      } else {
        const quantity =
          mappedVariants.length === 1 &&
          mappedVariants[0].variantName === "Original"
            ? mappedVariants[0].qty
            : 0;

        await axios.post(API_URL, {
          ...payload,
          quantity,
        });
      }

      toast.update(toastId, {
        render:
          editingId !== null
            ? "Product updated successfully!"
            : "Product added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });

      await fetchProducts();
      closeModal();
    } catch (err) {
      console.error("Save error:", err);

      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      price: product.price || "",
      image: product.image || "",
      category: product.category || "",
      variants: (product.variants || []).map((v) => ({
        id: v.id || null,
        variantName: v.variantName || "Original",
        price: parseFloat(v.price || product.price || 0),
        qty: parseInt(v.qty || 0, 10),
        images: v.images || [],
      })),
    });

    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    const toastId = toast.loading("Deleting product...");

    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchProducts();

      toast.update(toastId, {
        render: "Product deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("Delete error:", err);

      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to delete product",
        type: "error",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    }
  };

  const getTotalStock = (variants = []) =>
    variants.reduce((sum, v) => sum + (parseInt(v.qty, 10) || 0), 0);

  const presetVariants = [
    "Small Breed",
    "Large Breed",
    "Puppy",
    "Adult",
    "Senior",
    "1kg",
    "3kg",
  ];

  return (
    <div className="product-dashboard">
      <div className="dashboard-container">
        <Header title="🛍️ Product Dashboard" />

        <div className="dashboard-toolbar dashboard-toolbar--aligned">
          <div className="dashboard-heading">
            <h2 className="dashboard-title">Products</h2>
            <p className="dashboard-subtitle">
              Manage your catalog, variants, stock, and images.
            </p>
          </div>

          <div className="toolbar-actions">
            <button className="primary-btn" onClick={openAddModal}>
              + Add Product
            </button>
          </div>
        </div>

        <div className="product-grid">
          {products.length === 0 ? (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Start by adding your first product.</p>
            </div>
          ) : (
            paginatedProducts.map((p) => {
              const totalStock = getTotalStock(p.variants);

              return (
                <div key={p.id} className="product-card">
                  <div className="product-image">
                    {p.image ? (
                      <img src={p.image} alt={p.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>

                  <div className="product-content">
                    <div className="product-top-row">
                      <span className="category-badge">
                        {p.category || "Uncategorized"}
                      </span>
                      <span
                        className={`stock-badge ${
                          totalStock > 0 ? "in" : "out"
                        }`}
                      >
                        {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                      </span>
                    </div>

                    <h4 className="product-name">{p.name}</h4>
                    <p className="product-price">
                      ₱{parseFloat(p.price || 0).toFixed(2)}
                    </p>

                    <div className="product-summary">
                      <span>{p.variants?.length || 0} variants</span>
                    </div>

                    {p.variants?.length > 0 && (
                      <div className="product-variant-list">
                        {p.variants.map((v, i) => (
                          <div key={i} className="product-variant-item">
                            <span className="variant-name">{v.variantName}</span>
                            <span
                              className={`variant-stock ${
                                v.qty > 0 ? "in" : "out"
                              }`}
                            >
                              {v.qty > 0 ? `${v.qty} stock` : "Out"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="product-actions">
                    <button
                      className="secondary-btn"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

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

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h3>
                    {editingId !== null ? "Update Product" : "Add New Product"}
                  </h3>
                  <p>
                    Fill in product info, upload images, and manage variants.
                  </p>
                </div>
                <button className="icon-btn" onClick={closeModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-shell">
                <div className="modal-body">
                  <div className="product-editor">
                    <div className="editor-main">
                      <section className="editor-section">
                        <h4>Basic Information</h4>

                        <div className="form-group">
                          <label>Product Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Pedigree Adult Dog Food"
                            required
                          />
                        </div>

                        <div className="form-grid two">
                          <div className="form-group">
                            <label>Category</label>
                            <input
                              type="text"
                              name="category"
                              value={form.category}
                              onChange={handleChange}
                              placeholder="e.g. Dog Food"
                            />
                          </div>

                          <div className="form-group">
                            <label>Default Variant Price *</label>
                            <input
                              type="number"
                              name="price"
                              value={form.price}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                      </section>

                      <section className="editor-section">
                        <h4>Main Display Image</h4>

                        <div className="form-group">
                          <label>Upload Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageChange}
                          />
                        </div>

                        <div className="main-image-preview">
                          {form.image ? (
                            <img src={form.image} alt="Main product preview" />
                          ) : (
                            <div className="empty-upload-state">
                              No display image selected
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    <aside className="editor-side">
                      <section className="editor-section">
                        <div className="section-header">
                          <div>
                            <h4>Variants</h4>
                            <p className="section-note">
                              Add size, breed, life stage, or packaging variants.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="primary-btn small"
                            onClick={addVariant}
                          >
                            + Add Variant
                          </button>
                        </div>

                        <div className="preset-tags">
                          {presetVariants.map((item) => (
                            <button
                              key={item}
                              type="button"
                              className="tag-btn"
                              onClick={() => addPresetVariant(item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>

                        {form.variants.length === 0 ? (
                          <div className="variant-empty">
                            No variants added yet.
                          </div>
                        ) : (
                          form.variants.map((variant, idx) => (
                            <div key={variant.id || idx} className="variant-card">
                              <div className="variant-card-header">
                                <div>
                                  <h5>
                                    {variant.variantName?.trim()
                                      ? variant.variantName
                                      : `Variant ${idx + 1}`}
                                  </h5>
                                  <span
                                    className={`stock-badge ${
                                      variant.qty > 0 ? "in" : "out"
                                    }`}
                                  >
                                    {variant.qty > 0
                                      ? `${variant.qty} in stock`
                                      : "Out of stock"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  className="text-danger-btn"
                                  onClick={() => removeVariant(idx)}
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="form-group">
                                <label>Variant Name</label>
                                <input
                                  type="text"
                                  value={variant.variantName}
                                  onChange={(e) =>
                                    updateVariantField(
                                      idx,
                                      "variantName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Small Breed"
                                  required
                                />
                              </div>

                              <div className="form-grid two">
                                <div className="form-group">
                                  <label>Price</label>
                                  <input
                                    type="number"
                                    value={variant.price}
                                    min="0"
                                    step="0.01"
                                    onChange={(e) =>
                                      updateVariantField(
                                        idx,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    placeholder="0.00"
                                  />
                                </div>

                                <div className="form-group">
                                  <label>Stock</label>
                                  <input
                                    type="number"
                                    value={variant.qty}
                                    min="0"
                                    onChange={(e) =>
                                      updateVariantField(
                                        idx,
                                        "qty",
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              <div className="form-group">
                                <label>Variant Images</label>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleVariantImagesChange(idx, e.target.files)
                                  }
                                />
                              </div>

                              {variant.images?.length > 0 && (
                                <div className="variant-thumb-grid">
                                  {variant.images.map((img, i) => (
                                    <div key={i} className="variant-thumb">
                                      <img src={img} alt="" />
                                      <button
                                        type="button"
                                        className="variant-thumb-remove"
                                        onClick={() =>
                                          removeVariantImage(idx, i)
                                        }
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </section>
                    </aside>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingId !== null ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDashboard;