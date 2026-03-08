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
      setToastMessage("❌ Invalid contact number. Use 09 / 639 / +639 format.");
      setShowToast(true);
      return;
    }

    const cleanedCart = cart.map((item) => ({
      productId: item.productId || item.id,
      variantId: item.variantId || null,
      quantity: item.quantity,
      price: item.price,
      variantName:
        item.variantName || item.variant_name || item.name || "Product",
      variantImage: item.variantImage || item.imageUrl || item.image || null,
    }));

    const hasMissingVariant = cleanedCart.some((item) => !item.variantId);

    if (hasMissingVariant) {
      setToastType("error");
      setToastMessage("❌ Please select a variant before checkout.");
      setShowToast(true);
      return;
    }

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
      setToastMessage("✅ Order placed successfully!");
      setShowToast(true);

      onClose();
      navigate("/");
    } catch (error) {
      console.error("Payment error:", error);
      setToastType("error");
      setToastMessage("❌ Failed to process payment.");
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
        <button
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
        </button>

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