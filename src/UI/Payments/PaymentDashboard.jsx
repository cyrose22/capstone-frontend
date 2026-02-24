// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const PaymentDashboard = ({ cart, total, onClose, user, setToastMessage, setToastType, setShowToast, paymentMethod, setPaymentMethod,hasSelectedPayment, setHasSelectedPayment }) => {
//   const [receiptFile, setReceiptFile] = useState(null);
//   const [qrImage, setQrImage] = useState("");
//   const [showQRModal, setShowQRModal] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (!paymentMethod || paymentMethod.trim() === "") {
//       setToastType('error');
//       setToastMessage("❗ Please select a payment method.");
//       setShowToast(true);
//       return;
//     }

//     if (paymentMethod === "QR") {
//       axios
//         .get("https://capstone-backend-kiax.onrender.com/api/admin/qr-code")
//         .then((res) => {
//           if (res.data?.url) setQrImage(res.data.url);
//         })
//         .catch((err) => console.error("Failed to fetch QR image:", err));
//     }
//   }, [paymentMethod]);

//   const handleSubmitPayment = async () => {
//     if (!user.contact || user.contact.trim() === '') {
//       setToastType('error');
//       setToastMessage('⚠️ Please update your contact number before checking out.');
//       setShowToast(true);
//       return;
//     }

//     if (paymentMethod === "QR" && !receiptFile) {
//       setToastType('error');
//       setToastMessage('⚠️ Please upload your receipt before submitting.');
//       setShowToast(true);
//       return;
//     }

//     if (!paymentMethod || paymentMethod.trim() === '') {
//       setToastType('error');
//       setToastMessage("⚠️ Please select a payment method.");
//       setShowToast(true);
//       return;
//     }

//     const cleanedCart = cart.map(item => ({
//       productId: item.productId || item.id,
//       quantity: item.quantity,
//       price: item.price
//     }));

//     try {
//       setSubmitting(true);

//       let receiptUrl = "";
//       if (paymentMethod === "QR") {
//         const uploadData = new FormData();
//         uploadData.append("receipt", receiptFile);

//         const uploadRes = await axios.post("https://capstone-backend-kiax.onrender.com/upload-receipt", uploadData);
//         receiptUrl = uploadRes.data.url;
//       }

//       const salePayload = {
//         userId: user.id,
//         items: cleanedCart,
//         payment_method: paymentMethod,
//         receipt_url: receiptUrl,
//         contact: user.contact,
//         customer_name: user.fullname,
//       };

//       const createdSale = await axios.post("https://capstone-backend-kiax.onrender.com/sales", salePayload);

//       localStorage.setItem("orderSuccess", "true");
//       localStorage.setItem("recentOrderId", String(createdSale.data.saleId));

//       setToastType('success');
//       setToastMessage('✅ Order placed successfully!');
//       setShowToast(true);

//       localStorage.removeItem("cart");

//       setTimeout(() => {
//         window.location.reload();
//       }, 300);
//     } catch (error) {
//       console.error("Payment error:", error);
//       alert("Failed to process payment.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <div className="payment-popup-overlay">
//         <div className="payment-popup-content">
//           <h2 style={{
//             color: "#f23030",
//             fontSize: "20px",
//             fontWeight: "700",
//             display: "flex",
//             alignItems: "center",
//             gap: "10px",
//             marginBottom: "16px",
//             borderBottom: "2px solid #ffe0e0",
//             paddingBottom: "8px",
//           }}>
//             🧾 Payment Method
//           </h2>

//           <div className="payment-options">
//             <label className="radio-label">
//               <input
//                 type="radio"
//                 value="COD"
//                 checked={paymentMethod === "COD"}
//                 onChange={() => {
//                   setPaymentMethod("COD");
//                   setHasSelectedPayment(true);
//                 }}
//               />
//               <span>🚚 Cash on Delivery</span>
//             </label>

//             <label className="radio-label">
//               <input
//                 type="radio"
//                 value="QR"
//                 checked={paymentMethod === "QR"}
//                 onChange={() => {
//                   setPaymentMethod("QR");
//                   setHasSelectedPayment(true);
//                 }}
//               />
//               <span>📱 Pay via QR Code</span>
//             </label>

//             <p style={{ fontSize: "25px", marginBottom: "10px", textAlign: "right" }}>
//               Total: <strong>₱{total.toLocaleString()}</strong>
//             </p>
//           </div>

//           {paymentMethod === "QR" && (
//             <div
//               style={{
//                 marginTop: "12px",
//                 padding: "16px",
//                 border: "1px solid #f0f0f0",
//                 borderRadius: "10px",
//                 backgroundColor: "#fff7f7",
//                 boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   flexWrap: "wrap",
//                   alignItems: "center",
//                   gap: "12px",
//                   marginBottom: "12px",
//                 }}
//               >
//                 {/* View QR Button */}
//                 <button
//                   type="button"
//                   onClick={() => setShowQRModal(true)}
//                   style={{
//                     backgroundColor: "#f23030",
//                     color: "#fff",
//                     padding: "10px 16px",
//                     fontSize: "14px",
//                     fontWeight: "600",
//                     border: "none",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "6px",
//                   }}
//                 >
//                   📷 View QR Code
//                 </button>

//                 {/* Upload Receipt */}
//                 <div style={{ display: "flex", flexDirection: "column" }}>
//                   <label
//                     style={{
//                       position: "relative",
//                       display: "inline-block",
//                       backgroundColor: "#f5f5f5",
//                       color: "#333",
//                       fontWeight: "600",
//                       padding: "10px 16px",
//                       border: "1px solid #ddd",
//                       borderRadius: "6px",
//                       cursor: "pointer",
//                       fontSize: "14px",
//                     }}
//                   >
//                     📤 Upload Receipt
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => setReceiptFile(e.target.files[0])}
//                       style={{
//                         position: "absolute",
//                         left: 0,
//                         top: 0,
//                         width: "100%",
//                         height: "100%",
//                         opacity: 0,
//                         cursor: "pointer",
//                       }}
//                     />
//                   </label>
//                   {receiptFile && (
//                     <span style={{ fontSize: "12px", color: "#28a745", marginTop: "4px" }}>
//                       📎 {receiptFile.name}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
//             <button
//               onClick={handleSubmitPayment}
//               disabled={submitting}
//               style={{
//                 backgroundColor: submitting ? "#ccc" : "#ff4d00",
//                 color: "white",
//                 padding: "10px 20px",
//                 fontSize: "14px",
//                 fontWeight: "600",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: submitting ? "not-allowed" : "pointer",
//               }}
//             >
//               {submitting ? "⏳ Processing..." : "✅ Confirm"}
//             </button>

//             <button
//               onClick={onClose}
//               style={{
//                 backgroundColor: "#f0f0f0",
//                 color: "#333",
//                 padding: "10px 20px",
//                 fontSize: "14px",
//                 fontWeight: "600",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//               }}
//             >
//               ❌ Cancel
//             </button>
//           </div>
//         </div>
//       </div>

//       {showQRModal && qrImage && (
//         <div
//           style={{
//             position: "fixed",
//             top: "50%",
//             left: "calc(50% + 280px)",
//             transform: "translateY(-50%)",
//             backgroundColor: "#fff",
//             padding: "20px",
//             borderRadius: "12px",
//             boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
//             zIndex: 10000,
//             width: "360px",
//           }}
//         >
//           <h3 style={{ marginBottom: "12px", fontWeight: "600", fontSize: "16px" }}>📲 Scan to Pay via QR Code</h3>
//           <img
//             src={qrImage}
//             alt="GCash QR"
//             style={{
//               width: "100%",
//               borderRadius: "10px",
//               border: "1px solid #ccc",
//               marginBottom: "12px",
//             }}
//           />
//           <button
//             onClick={() => setShowQRModal(false)}
//             style={{
//               backgroundColor: "#f23030",
//               color: "#fff",
//               padding: "8px 16px",
//               fontSize: "13px",
//               fontWeight: "600",
//               border: "none",
//               borderRadius: "6px",
//               cursor: "pointer",
//               width: "100%",
//             }}
//           >
//             ❌ Close
//           </button>
//         </div>
//       )}
//     </>
//   );
// };

// export default PaymentDashboard;

import React, { useState } from "react";
import axios from "axios";

function FakeGCashModal({ total, user, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(user?.contact || "");
  const [error, setError] = useState("");

  const normalizeContact = (num) => {
    let cleaned = num.trim();
    if (cleaned.startsWith("09") && cleaned.length === 11) return "+63" + cleaned.slice(1);
    if (cleaned.startsWith("639") && cleaned.length === 12) return "+" + cleaned;
    if (cleaned.startsWith("+63") && cleaned.length === 13) return cleaned;
    return "";
  };

  const handlePay = () => {
    const normalized = normalizeContact(contact);
    if (!normalized) {
      setError("⚠️ Please enter a valid PH number (09XXXXXXXXX or 639XXXXXXXXX).");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const reference = `GCASH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      onSuccess(reference, normalized);
    }, 2000);
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "1.8rem",
          width: "400px",
          textAlign: "center",
          boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ color: "#0072CE", marginBottom: "1rem" }}>💳 GCash Payment</h2>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>
          You are paying: <strong>₱{total.toLocaleString()}</strong>
        </p>

        <input
          type="text"
          value={contact}
          placeholder="Enter GCash number"
          onChange={(e) => setContact(e.target.value)}
          style={{
            width: "100%",
            padding: "0.7rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginBottom: "0.5rem",
            outline: "none",
            transition: "0.2s",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #0072CE")}
          onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        />
        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: loading ? "#ccc" : "#0072CE",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "0.75rem",
            transition: "0.2s",
          }}
        >
          {loading ? "⏳ Processing..." : "Pay with GCash"}
        </button>

        <button
          onClick={onCancel}
          style={{
            width: "100%",
            padding: "0.65rem",
            backgroundColor: "#eee",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}

const PaymentDashboard = ({
  cart,
  total,
  onClose,
  user,
  setToastMessage,
  setToastType,
  setShowToast,
  paymentMethod,
  setPaymentMethod,
  setHasSelectedPayment,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [showGCashModal, setShowGCashModal] = useState(false);

  const createOrder = async (receiptUrl = "", contactOverride = "") => {
    const cleanedCart = cart.map((item) => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const salePayload = {
      userId: user.id,
      items: cleanedCart,
      payment_method: paymentMethod,
      receipt_url: receiptUrl,
      contact: contactOverride || user.contact,
      customer_name: user.fullname,
    };

    const createdSale = await axios.post("https://capstone-backend-kiax.onrender.com/sales", salePayload);

    localStorage.setItem("orderSuccess", "true");
    localStorage.setItem("recentOrderId", String(createdSale.data.saleId));

    setToastType("success");
    setToastMessage("✅ Order placed successfully!");
    setShowToast(true);

    localStorage.removeItem("cart");
    setTimeout(() => window.location.reload(), 300);
  };

  const handleSubmitPayment = async () => {
    if (!paymentMethod) {
      setToastType("error");
      setToastMessage("⚠️ Please select a payment method.");
      setShowToast(true);
      return;
    }

    if (paymentMethod === "GCash") {
      setShowGCashModal(true);
      return;
    }

    try {
      setSubmitting(true);
      await createOrder();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "14px",
          padding: "1.8rem",
          width: "90%",
          maxWidth: "440px",
          margin: "0 auto",
          boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        <h2 style={{ color: "#f23030", fontSize: "20px", fontWeight: "700", marginBottom: "1rem" }}>
          🧾 Select Payment Method
        </h2>

        {/* Payment options as styled cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1rem" }}>
          <label
            style={{
              padding: "0.8rem",
              border: paymentMethod === "COD" ? "2px solid #f23030" : "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "0.2s",
            }}
          >
            <input
              type="radio"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => {
                setPaymentMethod("COD");
                setHasSelectedPayment(true);
              }}
            />
            🚚 Cash on Delivery
          </label>

          <label
            style={{
              padding: "0.8rem",
              border: paymentMethod === "GCash" ? "2px solid #0072CE" : "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "0.2s",
            }}
          >
            <input
              type="radio"
              value="GCash"
              checked={paymentMethod === "GCash"}
              onChange={() => {
                setPaymentMethod("GCash");
                setHasSelectedPayment(true);
              }}
            />
            💳 Pay via GCash
          </label>
        </div>

        <p style={{ fontSize: "20px", marginTop: "20px", textAlign: "right" }}>
          Total: <strong>₱{total.toLocaleString()}</strong>
        </p>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleSubmitPayment}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#ccc" : "#4CAF50",
              color: "white",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "0.2s",
            }}
          >
            {submitting ? "⏳ Processing..." : "✅ Confirm"}
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: "#eee",
              color: "#333",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            ❌ Cancel
          </button>
        </div>
      </div>

      {showGCashModal && (
        <FakeGCashModal
          total={total}
          user={user}
          onSuccess={async (ref, normalized) => {
            setShowGCashModal(false);
            await createOrder(ref, normalized);
          }}
          onCancel={() => setShowGCashModal(false)}
        />
      )}
    </>
  );
};

export default PaymentDashboard;
