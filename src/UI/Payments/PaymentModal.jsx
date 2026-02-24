import React, { useState } from 'react';
import axios from 'axios';
import PaymentDashboard from '../Payments/PaymentDashboard';

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
  onClose
}) {
  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // ✅ Phone validation helper
  const isValidPhone = (phone) => {
    const regex = /^(09\d{9}|639\d{9}|\+639\d{9})$/;
    return regex.test(phone);
  };

  // 👇 upload receipt helper
  const uploadReceipt = async () => {
    if (!receiptFile) return "";

    const formData = new FormData();
    formData.append("file", receiptFile);

    setIsUploading(true);
    try {
      const res = await axios.post("http://localhost:5000/upload-receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data.url; // assume backend returns { url: "http://..." }
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

  // 👇 helper for GCash simulation
  const handleProceedPayment = async () => {
    // ✅ validate phone first
    if (!isValidPhone(user.contact)) {
      setToastType("error");
      setToastMessage("❌ Invalid contact number. Must start with 09 / 639 / +639 and contain 11 digits after.");
      setShowToast(true);
      return;
    }

    const cleanedCart = cart.map(item => ({
      productId: item.productId || item.id,
      variantId: item.variantId || null,
      quantity: item.quantity,
      price: item.price,
      variantName: item.variantName || item.variant_name || item.name || "Product",
      variantImage: item.variantImage || item.imageUrl || null
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

      const createdSale = await axios.post("http://localhost:5000/sales", salePayload);

      localStorage.setItem("orderSuccess", "true");
      localStorage.setItem("recentOrderId", String(createdSale.data.saleId));

      setToastType("success");
      setToastMessage("✅ Order placed successfully via GCash!");
      setShowToast(true);

      localStorage.removeItem("cart");

      onClose();
      window.location.href = "/consumer"; 

    } catch (error) {
      console.error("GCash simulation error:", error);
      alert("Failed to process GCash payment.");
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          borderRadius: '8px',
          padding: '1rem',
          width: '95%',
          maxWidth: '800px',
          maxHeight: '90%',
          overflowY: 'auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
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
          onProceedPayment={handleProceedPayment}  // ✅ pass simulation handler
        />
      </div>
    </div>
  );
}

export default PaymentModal;
