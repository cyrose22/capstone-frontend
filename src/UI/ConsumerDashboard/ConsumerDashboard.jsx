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
  const [cartBounce, setCartBounce] = useState(false);

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
    document.body.style.overflow = showCartModal ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showCartModal]);

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

  const showToastMessage = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const addToCart = (product, variant = null) => {
    const resolvedVariantId =
      variant?.variantId ?? product.variantId ?? null;

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.variantId === resolvedVariantId
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id &&
          item.variantId === resolvedVariantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: variant?.price ?? product.price,
          image: product.image || null,
          variantId: resolvedVariantId,
          variantName: variant?.variantName ?? product.variantName ?? null,
          variantImage: variant?.variantImage ?? product.variantImage ?? null,
          quantity: 1,
        },
      ];
    });

    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 350);

    showToastMessage("✅ Added to cart", "success");
  };

  const handleOpenCart = () => {
    setShowCartModal(true);
  };

  const handleOpenPayment = (value) => {
    if (!user?.token) {
      navigate("/login?redirect=/");
      return;
    }

    setShowPaymentModal(value);
  };

  const handleCheckout = (payload) => {
    if (!user?.token) {
      navigate("/login?redirect=/");
      return;
    }

    console.log("Checkout payload:", payload);
    setShowPaymentModal(true);
  };

  const updateCartQuantity = (id, qty, variantId = null) => {
    if (qty < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.variantId === variantId
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (id, variantId = null) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const formatCurrency = (amount) =>
    `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  
  const categoryCounts = products.reduce((acc, p) => {
    const c = p.category || "Others";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="storefront-layout">

      <header className="store-header">
        <div className="store-topbar">
          <span>Need help? Call us: +63 912 345 6789</span>
        </div>

        <div className="store-header-main">
          <div
            className="store-logo-section"
            onClick={() => {
              setActiveTab("shop");
              setSelectedCategory("All");
              goToProducts();
            }}
          >
            <img src={logo} alt="logo" className="store-logo" />
            <span className="store-name">Oscar D’Great</span>
          </div>

          <div className="store-icons">
            <NotificationPanel
              notifBounce={notifBounce}
              newStatusChanges={newStatusChanges}
              setNewStatusChanges={setNewStatusChanges}
            />

            <button
              className={`icon-btn ${cartBounce ? "cart-bounce" : ""}`}
              onClick={handleOpenCart}
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
                  {!user?.token ? (
                    <>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/login?redirect=/");
                        }}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/register?redirect=/");
                        }}
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActiveTab("profile");
                        }}
                      >
                        My Profile
                      </button>

                      <button
                        className="logout-btn"
                        onClick={() => {
                          localStorage.removeItem("user");
                          setUser(null);
                          setShowProfileMenu(false);
                          navigate("/");
                        }}
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="store-hero">
        <div className="store-hero-inner">
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
            <span>✅ Quality Products</span>
            <span>✅ Easy Ordering</span>
          </div>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={goToProducts}>
              Shop Now
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                if (!user?.token) {
                  navigate("/login?redirect=/dashboard/consumer");
                  return;
                }

                setActiveTab("orders");
              }}
            >
              Track Orders
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <h3>Trusted Pet Supplies</h3>
            <p>Quality food, treats & accessories</p>

            <div className="hero-mini">
              <span>🕒 Open 8AM – 7PM</span>
              <span>📍 Local Store</span>
            </div>
          </div>
        </div>
          
        </div>
      </section>

      <section className="category-strip">
        <div className="category-strip-inner">
          <div className="category-strip-title">
            <h2>Browse Products</h2>
            <p>Filter by category</p>
          </div>

          <div className="category-pills" role="tablist" aria-label="Product categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  goToProducts();
                }}
              >
                {cat === "All" ? "All" : `${cat} (${categoryCounts[cat] || 0})`}
              </button>
            ))}
          </div>
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
            products={products}
            cart={cart}
            setCart={setCart}
            setActiveTab={setActiveTab}
            setShowCartModal={setShowCartModal}
            setCancelModalVisible={setCancelModalVisible}
            setSaleToCancel={setSaleToCancel}
            setCancelReason={() => {}}  // or your real state if you have it
            enrichSalesWithImages={(x) => x} // or your real function if you have it
            setSalesHistory={setSalesHistory}
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
          setShowPaymentModal={handleOpenPayment}
          setShowCartModal={setShowCartModal}
          formatCurrency={formatCurrency}
          userId={user?.id}
          onCheckout={handleCheckout}
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
          clearCart={() => setCart([])}
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