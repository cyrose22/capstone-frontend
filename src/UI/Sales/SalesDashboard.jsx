import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './sales.css';
import Header from '../Header/Header';
import { useLocation } from "react-router-dom";

function SalesDashboard() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusTab, setStatusTab] = useState('processing');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelReason, setCancelReason] = useState('');
  const itemsPerPage = 10;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingSaleId, setCancelingSaleId] = useState(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };
  const location = useLocation();

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.state?.status) {
      setStatusTab(location.state.status);
      setCurrentPage(1);

      // clear state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handleStatusChanged = () => fetchSales();
    window.addEventListener('order-status-updated', handleStatusChanged);
    return () => {
      window.removeEventListener('order-status-updated', handleStatusChanged);
    };
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('https://capstone-backend-kiax.onrender.com/sales');
      setSales(res.data);
    } catch {
      alert('Failed to load sales');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://capstone-backend-kiax.onrender.com/products');
      setProducts(res.data);
    } catch {
      alert('Failed to load products');
    }
  };

  const handlePrint = () => {
    const receiptContent = document.getElementById('receipt-content').innerHTML;
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .receipt-container { width: 320px; margin: auto; border: 1px dashed #ccc; padding: 16px; }
        .receipt-header { text-align: center; border-bottom: 2px solid #ff5a5f; margin-bottom: 10px; }
        .receipt-header h1 { font-size: 20px; color: #ff5a5f; }
        .receipt-items { width: 100%; font-size: 12px; margin-top: 12px; border-collapse: collapse; }
        .receipt-items th, .receipt-items td { padding: 6px 4px; border-bottom: 1px solid #eee; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      </style>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Sales Receipt</title>${style}</head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header"><h1>Oscar D’Gr8 Sales Receipt</h1></div>
            ${receiptContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleSaleAdded = () => {
    setShowAddModal(false);
    fetchSales();
  };

  const updateStatus = async (id, newStatus, reason = '') => {
    try {
      await axios.put(`https://capstone-backend-kiax.onrender.com/sales/${id}/status`, { status: newStatus, reason });
      fetchSales();
    } catch {
      alert('Failed to update status');
    }
  };

  const completedSales = sales.filter(s => s.status === 'completed');
  const filteredSales = sales.filter((sale) => sale.status === statusTab);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIdx, startIdx + itemsPerPage);

  const totalSalesAmount = completedSales.reduce((acc, s) => acc + Number(s.total), 0);
  const totalItemsSold = completedSales.reduce((acc, s) => acc + (s.items?.reduce((sum, i) => sum + i.quantity, 0) || 0), 0);
  const totalItemsLeft = products.reduce((acc, product) => {
    const variantTotal = product.variants?.reduce((vAcc, v) => vAcc + Number(v.quantity || 0), 0) || 0;
    return acc + variantTotal;
  }, 0);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const uploadQrToServer = async () => {
    if (!qrFile) return alert('No file selected');
    const formData = new FormData();
    formData.append('qrImage', qrFile);
    try {
      await axios.post('https://capstone-backend-kiax.onrender.com/admin/upload-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('QR image uploaded successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to upload QR image');
    }
  };

  // ✅ NEW: Generate Report
  const handleGenerateReport = () => {
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; color: #ff5a5f; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border: 1px solid #ddd; font-size: 13px; }
        th { background-color: #f8f8f8; }
        .summary { margin-top: 20px; font-size: 14px; font-weight: bold; }
      </style>
    `;

    // Build rows including items per sale
    let rows = completedSales.map(sale => {
      const itemDetails = sale.items?.map(i => `${i.variant_name || i.name} × ${i.quantity}`).join(', ') || 'No items';
      return `
        <tr>
          <td>#${sale.id}</td>
          <td>${sale.customer_name || 'N/A'}</td>
          <td>${new Date(sale.created_at).toLocaleDateString()}</td>
          <td>${itemDetails}</td>
          <td>₱${Number(sale.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
      <html>
        <head><title>Sales Report</title>${style}</head>
        <body>
          <h1>Oscar D’Gr8 Sales Report</h1>
          <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th></tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5">No completed sales</td></tr>'}</tbody>
          </table>
          <div class="summary">
            📊 Total Sales: ₱${totalSalesAmount.toLocaleString()} <br/>
            🛍️ Total Items Sold: ${totalItemsSold} <br/>
            📦 Items Left in Stock: ${totalItemsLeft}
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };


  return (
    <div className="sales-dashboard sd">
      <Header title="💰 Sales Dashboard" />

      <div className="sd__container">
        {/* Top actions */}
        <div className="sd__topbar">
          <div className="sd__topbarLeft">
            <h2 className="sd__title">Sales Overview</h2>
            <p className="sd__subtitle">Monitor orders, update statuses, and print receipts.</p>
          </div>

          <div className="sd__topbarRight">
            <button className="sd__btn sd__btn--primary" onClick={handleGenerateReport}>
              📑 Generate Report
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="sales-summary sd__summary">
          <div className="summary-box sd__summaryCard">
            <div className="sd__summaryMeta">
              <span className="sd__summaryLabel">Total Sales</span>
              <span className="sd__summaryValue">₱{totalSalesAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="summary-box sd__summaryCard">
            <div className="sd__summaryMeta">
              <span className="sd__summaryLabel">Items Sold</span>
              <span className="sd__summaryValue">{totalItemsSold}</span>
            </div>
          </div>

          <div className="summary-box sd__summaryCard">
            <div className="sd__summaryMeta">
              <span className="sd__summaryLabel">Items Left</span>
              <span className="sd__summaryValue">{totalItemsLeft}</span>
            </div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="order-status-tabs sd__tabs">
          {["processing", "to receive", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              className={`sd__tab ${statusTab === status ? "sd__tab--active" : ""}`}
              onClick={() => {
                setStatusTab(status);
                setCurrentPage(1);
                fetchSales();
              }}
            >
              {status === "processing" && "⏳ Processing"}
              {status === "to receive" && "📦 To Receive"}
              {status === "completed" && "✅ Completed"}
              {status === "cancelled" && "❌ Cancelled"}
            </button>
          ))}
        </div>

        {/* Sales list */}
        {filteredSales.length === 0 ? (
          <div className="sd__empty">
            <div className="sd__emptyTitle">No sales in this status.</div>
            <div className="sd__emptySub">Try selecting another tab above.</div>
          </div>
        ) : (
          <div className="sales-card-list sd__grid">
            {paginatedSales.map((sale) => (
              <div key={sale.id} className="sales-card sd__card">
                <div className="card-header sd__cardHeader">
                  <div className="sd__orderMeta">
                    <div className="sd__orderId">Order #{sale.id}</div>
                    <div className="sd__orderDate">{new Date(sale.created_at).toLocaleString()}</div>
                  </div>

                  <span className={`status-tag sd__status status-${sale.status.replace(" ", "-")}`}>
                    {sale.status === "cancelled" ? "❌ Cancelled" : sale.status}
                  </span>
                </div>

                <div className="card-body stylish-body sd__cardBody">
                  <div className="info-row sd__row">
                    <span className="label sd__label">💰 Total: </span>
                    <span className="value sd__value">
                      ₱{Number(sale.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="info-row sd__row">
                    <span className="label sd__label">💳 Payment: </span>
                    <span className="value sd__value">{sale.payment_method || "N/A"}</span>
                  </div>

                  <div className="items-section sd__items">
                    <strong className="sd__itemsTitle">🛍️ Items: </strong>

                    <ul className="items-list sd__itemsList">
                      {sale.items?.length ? (
                        sale.items.map((item, idx) => (
                          <li key={idx} className="sd__item">
                            <img
                              src={item.variant_image || item.product_image}
                              alt={item.variant_name || item.product_name}
                              className="sd__itemImg"
                            />
                            <div className="sd__itemInfo">
                              <div className="sd__itemName">
                                {item.variant_name || item.product_name}
                              </div>
                              <div className="sd__itemSub">Qty: {item.quantity} pcs.</div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="sd__item sd__item--empty">No items</li>
                      )}
                    </ul>

                    {sale.status === "cancelled" && (
                      <div className="cancel-reason sd__cancelBox">
                        <div>
                          <strong>❌ Reason:</strong> {sale.cancel_description || "No reason provided."}
                        </div>
                        {sale.cancelled_by_name && (
                          <div>
                            <strong>🧍 Cancelled by:</strong>{" "}
                            {sale.cancelled_by_role === "admin" ? "Admin" : sale.cancelled_by_name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions sd__actions">
                  <button
                    className="sd__iconBtn"
                    title="View Receipt"
                    onClick={() => {
                      setSelectedSale(sale);
                      showToast("Viewing Receipt");
                    }}
                  >
                    🧾
                  </button>

                  {sale.status === "processing" && (
                    <>
                      <button
                        className="sd__iconBtn sd__iconBtn--blue"
                        title="Move to To Receive"
                        onClick={async () => {
                          await updateStatus(sale.id, "to receive");
                          window.dispatchEvent(new Event("order-status-updated"));
                          showToast("Moved to To Receive");
                        }}
                      >
                        📦
                      </button>

                      <button
                        className="sd__iconBtn sd__iconBtn--red"
                        title="Cancel Order"
                        onClick={() => {
                          setCancelingSaleId(sale.id);
                          setShowCancelModal(true);
                          showToast("Cancel Order");
                        }}
                      >
                        ❌
                      </button>
                    </>
                  )}

                  {sale.status === "to receive" && (
                    <button
                      className="sd__iconBtn sd__iconBtn--green"
                      title="Mark as Completed"
                      onClick={async () => {
                        await updateStatus(sale.id, "completed");
                        window.dispatchEvent(new Event("order-status-updated"));
                        setStatusTab("completed");
                        showToast("Marked as Completed");
                      }}
                    >
                      ✅
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="modal-overlay sd__modalOverlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content sd__modal" onClick={(e) => e.stopPropagation()}>
              <div className="sd__modalHeader">
                <h3>Cancel Order</h3>
                <button className="sd__modalX" onClick={() => setShowCancelModal(false)} aria-label="Close">
                  ×
                </button>
              </div>

              <textarea
                className="sd__textarea"
                placeholder="Reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />

              <div className="modal-actions sd__modalActions">
                <button className="sd__btn" onClick={() => setShowCancelModal(false)}>
                  Close
                </button>

                <button
                  className="sd__btn sd__btn--danger"
                  onClick={async () => {
                    if (!cancelReason.trim()) return alert("Please enter a reason");
                    try {
                      await axios.put(
                        `https://capstone-backend-kiax.onrender.com/sales/${cancelingSaleId}/status`,
                        { status: "cancelled", reason: cancelReason, cancelled_by: user.id }
                      );
                      setShowCancelModal(false);
                      setCancelReason("");
                      setCancelingSaleId(null);
                      fetchSales();
                    } catch {
                      alert("Failed to cancel order");
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Popup */}
        {selectedSale && (
          <div className="modal-overlay sd__modalOverlay" onClick={() => setSelectedSale(null)}>
            <div className="modal-content fancy-receipt sd__modal sd__modal--wide" onClick={(e) => e.stopPropagation()}>
              <div className="sd__modalHeader">
                <h3>Receipt</h3>
                <button className="sd__modalX" onClick={() => setSelectedSale(null)} aria-label="Close">
                  ×
                </button>
              </div>

              <div id="receipt-content" className="sd__receipt">
                <h2>Oscar D’Gr8 Sales Receipt</h2>
                <p><strong>Receipt ID:</strong> #{selectedSale.id}</p>
                <p><strong>Customer:</strong> {selectedSale.customer_name || "N/A"}</p>
                <p><strong>Contact:</strong> {selectedSale.contact || "N/A"}</p>
                <p><strong>Payment:</strong> {selectedSale.payment_method}</p>
                <p><strong>Status:</strong> {selectedSale.status}</p>
                <p><strong>Date:</strong> {new Date(selectedSale.created_at).toLocaleString()}</p>

                <table className="receipt-items">
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <img
                            src={item.variant_image || item.product_image}
                            alt={item.variant_name || item.product_name}
                            style={{ width: "40px", height: "40px", marginRight: "6px", objectFit: "cover", verticalAlign: "middle", borderRadius: 8 }}
                          />
                          {item.variant_name || item.product_name}
                        </td>
                        <td>{item.quantity}</td>
                        <td>₱{Number(item.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                        <td>₱{(item.quantity * item.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><td colSpan="3">Total</td><td>₱{Number(selectedSale.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td></tr>
                  </tfoot>
                </table>
              </div>

              <div className="modal-actions sd__modalActions">
                <button className="sd__btn sd__btn--primary" onClick={handlePrint}>🖨️ Print</button>
                <button className="sd__btn" onClick={() => setSelectedSale(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Image Popup */}
        {showReceiptPopup && (
          <div className="modal-overlay sd__modalOverlay" onClick={() => setShowReceiptPopup(false)}>
            <div className="modal-content sd__modal" onClick={(e) => e.stopPropagation()}>
              <div className="sd__modalHeader">
                <h3>Receipt Image</h3>
                <button className="sd__modalX" onClick={() => setShowReceiptPopup(false)} aria-label="Close">
                  ×
                </button>
              </div>
              <img src={selectedReceiptUrl} alt="Attached Receipt" className="sd__receiptImg" />
            </div>
          </div>
        )}
        {/* Toast */}
        {toastMsg && <div className="quick-toast sd__toast">{toastMsg}...</div>}
      </div>
    </div>
  );
}

export default SalesDashboard;
