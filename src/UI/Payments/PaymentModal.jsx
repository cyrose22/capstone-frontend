import React, { useState } from "react";
import axios from "axios";
import PaymentDashboard from "../Payments/PaymentDashboard";
import { useNavigate } from "react-router-dom";

function PaymentModal({
  cart,
  user,
  paymentMethod,
  setPaymentMethod,
  hasSelectedPayment,
  setHasSelectedPayment,
  setToastMessage,
  setToastType,
  setShowToast,
  onClose,
  clearCart,
  fetchProducts,
  setActiveTab,
}) {
  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const isValidPhone = (phone) =>
    /^(09\d{9}|639\d{9}|\+639\d{9})$/.test(phone || "");

  const getAvailableStock = (item) =>
    Number(
      item.stock ??
        item.variantStock ??
        item.quantity_available ??
        item.availableStock ??
        0
    );

  const uploadReceipt = async () => {
    if (!receiptFile) return "";

    const formData = new FormData();
    formData.append("receipt", receiptFile);

    setIsUploading(true);
    try {
      const res = await axios.post(
        "https://capstone-backend-kiax.onrender.com/upload-receipt",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data.url || "";
    } catch (err) {
      console.error("Upload error:", err);
      setToastType("error");
      setToastMessage("❌ Failed to upload receipt");
      setShowToast(true);
      return "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedPayment = async () => {
    if (!user?.id) {
      setToastType("error");
      setToastMessage("❌ Please login first.");
      setShowToast(true);
      return;
    }

    if (!isValidPhone(user.contact)) {
      setToastType("error");
      setToastMessage("❌ Invalid contact number.");
      setShowToast(true);
      return;
    }

    const invalidItem = cart.find(
      (item) => Number(item.quantity || 0) > getAvailableStock(item)
    );

    if (invalidItem) {
      const availableStock = getAvailableStock(invalidItem);
      const itemLabel =
        invalidItem.variantName &&
        invalidItem.variantName !== invalidItem.name &&
        invalidItem.variantName.toLowerCase() !== "original"
          ? `${invalidItem.name} (${invalidItem.variantName})`
          : invalidItem.name || "this product";

      setToastType("error");
      setToastMessage(
        `❌ Not enough stock for ${itemLabel}. Only ${availableStock} left in stock.`
      );
      setShowToast(true);
      return;
    }

    const cleanedCart = cart.map((item) => ({
      productId: Number(item.productId || item.id),
      variantId:
        item.variantId !== undefined && item.variantId !== null
          ? Number(item.variantId)
          : null,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      variantName:
        item.variantName || item.variant_name || item.name || "Product",
      variantImage: item.variantImage || item.imageUrl || item.image || null,
    }));

    try {
      const uploadedUrl = await uploadReceipt();

      const salePayload = {
        userId: user.id,
        items: cleanedCart,
        payment_method: "GCash",
        receipt_url: uploadedUrl,
        contact: user.contact,
        customer_name: user.fullname,
      };

      const createdSale = await axios.post(
        "https://capstone-backend-kiax.onrender.com/sales",
        salePayload
      );

      if (fetchProducts) {
        await fetchProducts();
      }

      localStorage.setItem("orderSuccess", "true");
      localStorage.setItem("recentOrderId", String(createdSale.data.saleId));
      localStorage.removeItem("cart");

      if (clearCart) clearCart();

      setToastType("success");
      setToastMessage("✅ Order has been placed.");
      setShowToast(true);

      onClose();

      setTimeout(() => {
        if (setActiveTab) setActiveTab("orders");
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Payment error:", error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to process payment.";

      setToastType("error");
      setToastMessage(`❌ ${backendMessage}`);
      setShowToast(true);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 20000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(860px, 96vw)",
          maxHeight: "90vh",
          borderRadius: 18,
          overflow: "hidden",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.6)",
          position: "relative",
        }}
      >
        {/* <button
          onClick={onClose}
          aria-label="Close payment modal"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.10)",
            background: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontSize: 20,
            zIndex: 10,
          }}
        >
          ×
        </button> */}

        <div
          style={{
            padding: 16,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <PaymentDashboard
            cart={cart}
            total={total}
            user={user}
            onClose={onClose}
            setToastMessage={setToastMessage}
            setToastType={setToastType}
            setShowToast={setShowToast}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            hasSelectedPayment={hasSelectedPayment}
            setHasSelectedPayment={setHasSelectedPayment}
            onProceedPayment={handleProceedPayment}
            isUploading={isUploading}
            receiptFile={receiptFile}
            setReceiptFile={setReceiptFile}
          />
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;