import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./consumer-dashboard.css";

import ShopTab from "../Shop/ShopTab";
import OrdersTab from "../Orders/OrderTab";
import ProfileTab from "../Profile/ProfileTab";
import CartModal from "../CartModal/CartModal";
import PaymentModal from "../Payments/PaymentModal";
import NotificationPanel from "../Notification/NotificationPanel";
import VariantModal from "../Variant/VariantModal";
import CancelOrderModal from "../CancelOrder/CancelOrderModal";
import ToastMessage from "../ToastMessage/ToastMessage";

import logo from "../../assets/logo.png";

function ConsumerDashboard() {
  const navigate = useNavigate();

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
  const [savingPassword, setSavingPassword] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const productsRef = useRef(null);

  const goToProducts = () => {
    setActiveTab("shop");
    // wait for ShopTab to render
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [
        "All",
        ...new Set(products.map((p) => p.category || "Others")),
      ];
      setCategories(uniqueCategories);
    }
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user?.id) fetchSales();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "https://capstone-backend-kiax.onrender.com/products"
      );
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get(
        `https://capstone-backend-kiax.onrender.com/sales/user/${user.id}`
      );

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

      setSalesHistory(updatedSales);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product, variant = null) => {
    if (!user) {
      navigate("/");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.variantId === variant?.variantId
      );

      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: variant ? variant.price : product.price,
          image: product.image,
          variantId: variant?.variantId || null,
          variantName: variant?.variantName,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const formatCurrency = (amount) =>
    `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="storefront-layout">

      <header className="store-header">

        {/* TOP BAR */}
        <div className="store-topbar">
          <span>Need help? Call us: +63 912 345 6789</span>
        </div>

        {/* MAIN NAV */}
        <div className="store-header-main">

          <div className="store-logo-section">
            <img src={logo} alt="logo" className="store-logo" />
          </div>

          {/* <nav className="store-nav">
            <button
              className={activeTab === "shop" ? "nav-active" : ""}
              onClick={() => setActiveTab("shop")}
            >
              Shop
            </button>

            <button
              className={activeTab === "orders" ? "nav-active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>

            <button
              className={activeTab === "profile" ? "nav-active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
          </nav> */}

          <div className="store-icons">

            <NotificationPanel
              notifBounce={notifBounce}
              newStatusChanges={newStatusChanges}
              setNewStatusChanges={setNewStatusChanges}
            />

            <button
              className="icon-btn"
              onClick={() => setShowCartModal(true)}
            >
              🛒
              {cart.length > 0 && (
                <span className="icon-badge">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            <div className="profile-wrapper">
              <button
                className="icon-btn"
                onClick={() => setShowProfileMenu((p) => !p)}
              >
                👤
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button>Change Password</button>

                  <button
                    className="logout-btn"
                    onClick={() => {
                      localStorage.removeItem("user");
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </header>

      <section className="store-hero">
        <div className="hero-left">
          {/* small badge */}
          <div className="hero-badge">🐾 Trusted Pet Supplies</div>

          {/* logo */}
          <img src={logo} alt="Pet Store" className="hero-logo" />

          {/* subtitle */}
          <p className="hero-subtitle">
            Premium food, treats, vitamins & accessories
          </p>

          {/* little feature chips */}
          <div className="hero-features">
            <span>✅ Fast Delivery</span>
            <span>✅ Quality Products</span>
            <span>✅ Easy Ordering</span>
          </div>

          <div className="hero-buttons">
            <button className="hero-primary-btn" onClick={goToProducts}>
              Shop Now
            </button>

            <button
              className="hero-secondary-btn"
              onClick={() => setActiveTab("orders")}
            >
              Track Orders
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <h3>Free Delivery</h3>
            <p>Orders over ₱1500</p>

            <div className="hero-mini">
              <span>🕒 8AM–6PM</span>
              <span>📍 Local Store</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pet-categories">

        <h2>Categories</h2>

        <div className="category-grid">
          {categories
            .filter((cat) => cat !== "All")
            .map((cat) => (
              <div
                key={cat}
                className="category-card"
                onClick={() => {
                  setSelectedCategory(cat);
                  goToProducts();
                }}
              >
                <h3>{cat}</h3>
              </div>
          ))}
        </div>

      </section>

      <div className="store-content">

        {activeTab === "shop" && (
          <div ref={productsRef}>
            <ShopTab
              products={products}
              addToCart={addToCart}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        )}

        {activeTab === "orders" && (
          <OrdersTab
            salesHistory={salesHistory}
            user={user}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            user={user}
            setUser={setUser}
          />
        )}

      </div>

      {showCartModal && (
        <CartModal
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
          onClose={() => setCancelModalVisible(false)}
        />
      )}

      {showToast && (
        <ToastMessage
          type={toastType}
          message={toastMessage}
        />
      )}

    </div>
  );
}

export default ConsumerDashboard;