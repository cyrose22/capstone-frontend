import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ShopTab from "../Shop/ShopTab";
import OrdersTab from "../Orders/OrderTab";
import ProfileTab from "../Profile/ProfileTab";
import CartModal from "../CartModal/CartModal";
import PaymentModal from "../Payments/PaymentModal";
import NotificationPanel from "../Notification/NotificationPanel";
import VariantModal from "../Variant/VariantModal";
import CancelOrderModal from "../CancelOrder/CancelOrderModal";
import ToastMessage from "../ToastMessage/ToastMessage";

function ConsumerDashboard() {
  const navigate = useNavigate();

  // States
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("shop");
  const [user, setUser] = useState(null);

  const [showCartModal, setShowCartModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [hasSelectedPayment, setHasSelectedPayment] = useState(false);

  const [notifBounce, setNotifBounce] = useState(false);
  const [newStatusChanges, setNewStatusChanges] = useState([]);
  const notifRef = useRef(null);

  const previousStatusesRef = useRef({});

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [showToast, setShowToast] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Effects
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user?.id) fetchSales();
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://capstone-backend-kiax.onrender.com/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get(`https://capstone-backend-kiax.onrender.com/sales/user/${user.id}`);
      const updatedSales = res.data;

      updatedSales.forEach((sale) => {
        const prevStatus = previousStatusesRef.current[sale.id];
        if (prevStatus && prevStatus !== sale.status) {
          setNewStatusChanges((prev) => [
            ...prev,
            { id: sale.id, status: sale.status },
          ]);
          setNotifBounce(true);
          setTimeout(() => setNotifBounce(false), 1000);
        }
        previousStatusesRef.current[sale.id] = sale.status;
      });

      setSalesHistory(enrichSalesWithImages(updatedSales, products));
    } catch (err) {
      console.error("Failed to load sales:", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchSales();
    const interval = setInterval(fetchSales, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const formatCurrency = (amount) =>
    `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const enrichSalesWithImages = (sales, products) => {
    return sales.map((sale) => ({
      ...sale,
      items: sale.items.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        const variant =
          product?.variants?.find(
            (v) => String(v.id) === String(item.variantId || item.variant_id)
          ) || null;
        return {
          ...item,
          variantId: item.variantId || item.variant_id || variant?.id,
          variantName: item.variantName || variant?.variant_name,
          variantImage: item.variantImage || variant?.images?.[0],
          image: product?.image,
          name: item.name || product?.name,
        };
      }),
    }));
  };

  const norm = (v) => (v == null ? null : String(v).trim().toLowerCase());

  const addToCart = (product, variant = null) => {
    setCart((prev) => {
      const variantId = variant?.variantId || null;
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          norm(item.variantId) === norm(variantId) &&
          norm(item.variantName) === norm(variant?.variantName)
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: variant ? variant.price : product.price,
          image: product.image,
          variantId,
          variantName: variant?.variantName,
          variantImage: variant?.variantImage || product.image,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (id, qty, variantId, variantName) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id &&
        norm(item.variantId) === norm(variantId) &&
        norm(item.variantName) === norm(variantName)
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (id, variantId, variantName) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            norm(item.variantId) === norm(variantId) &&
            norm(item.variantName) === norm(variantName)
          )
      )
    );
  };

  const openVariantModal = (product, images, title, index = 0) => {
    setSelectedProduct(product);
    setModalImages(images);
    setModalTitle(title);
    setCurrentModalImageIndex(index);
    setVariantModalOpen(true);
  };

  const handlePasswordSave = async () => {
    if (!newPassword.trim()) return alert("Password can't be empty");
    try {
      setSavingPassword(true);
      await axios.put(`https://capstone-backend-kiax.onrender.com/users/${user.id}/password`, {
        password: newPassword,
      });
      alert("Password updated!");
      setEditingPassword(false);
      setNewPassword("");
    } catch {
      alert("Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#f5f6fa",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "#fff",
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          padding: "1rem 0.5rem",
          boxShadow: "2px 0 6px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <h3 style={{ margin: 0, color: "#e74c3c" }}>Oscar D'Great</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
            Pet Trading Supplies
          </p>
        </div>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {["shop", "orders", "profile"].map((tab) => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.9rem 1rem",
                cursor: "pointer",
                margin: "0.3rem 0",
                borderRadius: "0.6rem",
                backgroundColor: activeTab === tab ? "#ffecec" : "transparent",
                color: activeTab === tab ? "#e74c3c" : "#333",
                fontWeight: activeTab === tab ? "600" : "500",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeTab === tab ? "#ffecec" : "#f9f9f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeTab === tab ? "#ffecec" : "transparent")
              }
            >
              {tab === "shop" && "🛒 Shop"}
              {tab === "orders" && "📜 Orders"}
              {tab === "profile" && "👤 Profile"}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            padding: "1rem",
            background: "#fff",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ margin: 0 }}>🛍️ Welcome, {user?.fullname || "Guest"}!</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <NotificationPanel
              notifBounce={notifBounce}
              newStatusChanges={newStatusChanges}
              setNewStatusChanges={setNewStatusChanges}
              notifRef={notifRef}
            />

            {/* Cart */}
            <button
              onClick={() => setShowCartModal(true)}
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              🛒
              {cart.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "#e74c3c",
                    color: "#fff",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                  }}
                >
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Profile */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowProfileMenu((p) => !p)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                👤
              </button>
              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "0.5rem",
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setEditingPassword(true)}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      navigate("/");
                    }}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#e74c3c",
                      fontWeight: "600",
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {activeTab === "shop" && (
            <ShopTab
              products={products}
              addToCart={addToCart}
              openVariantModal={openVariantModal}
            />
          )}
          {activeTab === "orders" && (
            <OrdersTab
              salesHistory={salesHistory}
              products={products}
              cart={cart}
              setCart={setCart}
              setActiveTab={setActiveTab}
              setShowCartModal={setShowCartModal}
              setCancelModalVisible={setCancelModalVisible}
              setSaleToCancel={setSaleToCancel}
              setCancelReason={setCancelReason}
              enrichSalesWithImages={enrichSalesWithImages}
              setSalesHistory={setSalesHistory}
              user={user}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab user={user} setUser={setUser} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showCartModal && (
        <CartModal
          key={cart.length}
          cart={cart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          setShowPaymentModal={setShowPaymentModal}
          setShowCartModal={setShowCartModal}
          formatCurrency={formatCurrency}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          cart={cart}
          user={user}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          hasSelectedPayment={hasSelectedPayment}
          setHasSelectedPayment={setHasSelectedPayment}
          setToastMessage={setToastMessage}
          setToastType={setToastType}
          setShowToast={setShowToast}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
      {variantModalOpen && (
        <VariantModal
          product={selectedProduct}
          currentIndex={currentModalImageIndex}
          setCurrentIndex={setCurrentModalImageIndex}
          onClose={() => setVariantModalOpen(false)}
          addToCart={addToCart}
        />
      )}
      {cancelModalVisible && (
        <CancelOrderModal
          saleToCancel={saleToCancel}
          user={user}
          products={products}
          enrichSalesWithImages={enrichSalesWithImages}
          setSalesHistory={setSalesHistory}
          onClose={() => setCancelModalVisible(false)}
        />
      )}

      {/* Change Password Modal */}
      {editingPassword && (
        <div
          onClick={() => setEditingPassword(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setEditingPassword(false)}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
            <div style={{ marginBottom: '1rem' }}>
              <h2>🔐 Update Password</h2>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                Keep your account secure by using a strong password
              </p>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '6px',
                marginBottom: '0.75rem',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label htmlFor="showPassword" style={{ fontSize: '0.9rem' }}>
                Show Password
              </label>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
              }}
            >
              <button
                onClick={() => setEditingPassword(false)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ccc',
                  cursor: 'pointer',
                }}
              >
                ❌ Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={savingPassword}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {savingPassword ? 'Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <ToastMessage type={toastType} message={toastMessage} />}
    </div>
  );
}

export default ConsumerDashboard;
