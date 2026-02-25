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
import logo from '../../assets/logo.png';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="store-container">

      {/* TOP BAR */}
      <div className="top-bar">
        <span>Get 50% Off on Selected Items</span>
        <button>Shop Now</button>
      </div>

      {/* NAVBAR */}
      <header className="store-navbar">

        <div className="nav-left">
          <img src={logo} alt="logo" className="store-logo" />
          <h2>Oscar D'Great</h2>
        </div>

        <div className="nav-center">
          <input type="text" placeholder="Search Product..." />
        </div>

        <div className="nav-right">
          <button className="nav-icon">🔔</button>

          <button
            className="nav-icon"
            onClick={() => setShowCartModal(true)}
          >
            🛒
            {cart.length > 0 && (
              <span className="cart-badge">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          <button className="nav-icon">👤</button>
        </div>

      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Premium Pet Supplies</h1>
          <p>Everything your pet needs in one place</p>
          <button>Shop Now</button>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <main className="store-content">
        <ShopTab
          products={products}
          addToCart={addToCart}
          openVariantModal={openVariantModal}
        />
      </main>

    </div>
  );
}

export default ConsumerDashboard;
