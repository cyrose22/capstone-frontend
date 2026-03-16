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
    }, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 30000,
      }}
    >
      <div
        style={{
          width: "min(420px, 96vw)",
          borderRadius: 18,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 950, fontSize: 16, color: "#0f172a" }}>💳 GCash Payment</div>
          <button
            onClick={onCancel}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 10, color: "#64748b", fontWeight: 700 }}>
          Amount to pay: <span style={{ color: "#0f172a", fontWeight: 950 }}>₱{total.toLocaleString()}</span>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>GCash number</label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="09XXXXXXXXX / 639XXXXXXXXX"
            style={{
              width: "100%",
              marginTop: 6,
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontWeight: 800,
              background: "#fff",
            }}
          />
          {error && <div style={{ marginTop: 8, color: "#ef4444", fontWeight: 800, fontSize: 12 }}>{error}</div>}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button
            onClick={handlePay}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 14,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              color: "#fff",
              fontWeight: 950,
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #0ea5e9)",
              boxShadow: "0 16px 30px rgba(37,99,235,0.25)",
            }}
          >
            {loading ? "⏳ Processing..." : "Pay with GCash"}
          </button>

          <button
            onClick={onCancel}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(15,23,42,0.04)",
              cursor: "pointer",
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Cancel
          </button>
        </div>
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

  const createOrder = async (contactOverride = "", paymentReference = "") => {
    const cleanedCart = cart.map((item) => ({
      productId: Number(item.productId || item.id),
      variantId:
        item.variantId !== undefined &&
        item.variantId !== null &&
        !Number.isNaN(Number(item.variantId))
          ? Number(item.variantId)
          : null,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      variantName: item.variantName || item.name,
      variantImage: item.variantImage || item.image || null,
    }));

    if (cleanedCart.some((i) => i.variantId === null)) {
      console.error("Invalid checkout items:", cleanedCart);
      alert("A product variant is missing. Please re-add the item.");
      return;
    }

    const salePayload = {
      userId: user.id,
      items: cleanedCart,
      payment_method: paymentMethod,
      contact: contactOverride || user.contact,
      customer_name: user.fullname,
    };

    const createdSale = await axios.post(
      "https://capstone-backend-kiax.onrender.com/sales",
      salePayload
    );

    localStorage.setItem("orderSuccess", "true");
    localStorage.setItem("recentOrderId", String(createdSale.data.saleId));

    setToastType("success");
    setToastMessage(
      paymentReference
        ? `✅ Payment successful! Ref: ${paymentReference}`
        : "✅ Order placed successfully!"
    );
    setShowToast(true);

    localStorage.removeItem("cart");

    setTimeout(() => {
      window.location.reload();
    }, 1500);
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

  const OptionCard = ({ value, title, subtitle, icon, accent }) => {
    const selected = paymentMethod === value;

    return (
      <button
        type="button"
        onClick={() => {
          setPaymentMethod(value);
          setHasSelectedPayment(true);
        }}
        style={{
          width: "100%",
          textAlign: "left",
          borderRadius: 16,
          padding: 14,
          border: selected ? `2px solid ${accent}` : "1px solid rgba(0,0,0,0.10)",
          background: selected ? `${accent}10` : "rgba(255,255,255,0.85)",
          boxShadow: selected
            ? "0 16px 40px rgba(15,23,42,0.12)"
            : "0 10px 26px rgba(15,23,42,0.06)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          transition: "0.18s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: selected ? `${accent}1A` : "rgba(15,23,42,0.05)",
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 14 }}>
                {title}
              </div>
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#64748b",
                marginTop: 3,
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        {/* Custom radio */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `2px solid ${selected ? accent : "rgba(100,116,139,0.7)"}`,
            background: selected ? accent : "#fff",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {selected ? "✓" : ""}
        </div>
      </button>
    );
  };

  return (
    <>
      <div
        style={{
          width: "min(520px, 96vw)",
          margin: "0 auto",
          borderRadius: 20,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.80))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(239,68,68,0.10)",
                display: "grid",
                placeItems: "center",
              }}
            >
              🧾
            </div>
            <div>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Select Payment Method</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginTop: 2 }}>
                Choose how you want to pay
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <OptionCard
              value="COD"
              title="Cash on Delivery"
              subtitle="Pay when your order arrives"
              icon="🚚"
              accent="#ef4444"
            />
            <OptionCard
              value="GCash"
              title="Pay via GCash"
              subtitle="Fast & convenient e-wallet payment"
              icon="💳"
              accent="#2563eb"
            />
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ color: "#64748b", fontWeight: 900 }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 950, color: "#0f172a" }}>
              ₱{Number(total).toLocaleString()}
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={onClose}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "rgba(15,23,42,0.04)",
                cursor: "pointer",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmitPayment}
              disabled={!paymentMethod || submitting}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                color: "#fff",
                fontWeight: 950,
                background:
                  !paymentMethod || submitting
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow:
                  !paymentMethod || submitting
                    ? "none"
                    : "0 16px 30px rgba(34,197,94,0.22)",
              }}
            >
              {submitting ? "⏳ Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>

      {showGCashModal && (
        <FakeGCashModal
          total={total}
          user={user}
          onSuccess={async (ref, normalized) => {
            setShowGCashModal(false);
            await createOrder(normalized, ref);
          }}
          onCancel={() => setShowGCashModal(false)}
        />
      )}
    </>
  );
};

export default PaymentDashboard;