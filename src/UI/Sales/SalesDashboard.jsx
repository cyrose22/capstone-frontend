import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './sales.css';
import Header from '../Header/Header';

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

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleStatusChanged = () => fetchSales();
    window.addEventListener('order-status-updated', handleStatusChanged);
    return () => {
      window.removeEventListener('order-status-updated', handleStatusChanged);
    };
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('http://localhost:5000/sales');
      setSales(res.data);
    } catch {
      alert('Failed to load sales');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
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
      await axios.put(`http://localhost:5000/sales/${id}/status`, { status: newStatus, reason });
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
      await axios.post('http://localhost:5000/admin/upload-qr', formData, {
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
    <div className="sales-dashboard">
      <Header title="💰 Sales Dashboard" />
      <br/>

      <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
        <button className="register-staff-btn" onClick={handleGenerateReport} style={{ marginLeft: '10px' }}>📑 Generate Report</button>
      </div>

      {/* === SALES SUMMARY === */}
      <div className="sales-summary">
        <div className="summary-box"><h4>₱{totalSalesAmount.toLocaleString()}</h4><span>Total Sales</span></div>
        <div className="summary-box"><h4>{totalItemsSold}</h4><span>Items Sold</span></div>
        <div className="summary-box"><h4>{totalItemsLeft}</h4><span>Items Left</span></div>
      </div>

      {/* === STATUS TABS === */}
      <div className="order-status-tabs">
        {['processing', 'to receive', 'completed','cancelled'].map((status) => (
          <button key={status} className={statusTab === status ? 'active' : ''} onClick={() => { setStatusTab(status); setCurrentPage(1); fetchSales(); }}>
            {status === 'processing' && '⏳ Processing'}
            {status === 'to receive' && '📦 To Receive'}
            {status === 'completed' && '✅ Completed'}
            {status === 'cancelled' && '❌ Cancel'}
          </button>
        ))}
      </div>

      {/* === SALES LIST === */}
      {filteredSales.length === 0 ? (
        <p>No sales in this status.</p>
      ) : (
        <div className="sales-card-list">
          {paginatedSales.map((sale) => (
            <div key={sale.id} className="sales-card">
              <div className="card-header">
                <span><strong>Order ID:</strong> #{sale.id}</span>
                <span className={`status-tag status-${sale.status.replace(' ', '-')}`}>{sale.status === 'cancelled' ? '❌ Cancelled' : sale.status}</span>
              </div>
              <div className="card-body stylish-body">
                <div className="info-row"><span className="label">📅 Date:</span><span className="value">{new Date(sale.created_at).toLocaleString()}</span></div>
                <div className="info-row"><span className="label">💰 Total:</span><span className="value">₱{Number(sale.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
                <div className="info-row"><span className="label">💳 Payment Method:</span><span className="value">{sale.payment_method || 'N/A'}</span></div>
                <div className="items-section">
                  <strong>🛍️ Items:</strong>
                  <ul className="items-list">
                    {sale.items?.length ? sale.items.map((item, idx) => (
                      <li key={idx}>
                        <img src={item.variant_image} alt={item.variant_name} style={{ width: '40px', height: '40px', marginRight: '6px', objectFit: 'cover', verticalAlign: 'middle' }} />
                        <span className="item-name">{item.variant_name || item.name}</span> × {item.quantity} pcs.
                      </li>
                    )) : <li>No items</li>}
                  </ul>
                  {sale.status === 'cancelled' && (
                    <div className="cancel-reason">
                      <div><strong>❌ Reason:</strong> {sale.cancel_description || 'No reason provided.'}</div>
                      {sale.cancelled_by_name && (<div><strong>🧍 Cancelled by:</strong> {sale.cancelled_by_role === 'admin' ? 'Admin' : sale.cancelled_by_name}</div>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="card-actions">
                <button className="icon-btn" title="View Receipt" onClick={() => { setSelectedSale(sale); showToast('Viewing Receipt'); }}>🧾</button>
                {sale.status === 'processing' && (
                  <>
                    <button className="icon-btn" title="Move to To Receive" onClick={async () => { await updateStatus(sale.id, 'to receive'); window.dispatchEvent(new Event('order-status-updated')); showToast('Moved to To Receive'); }}>📦</button>
                    <button className="icon-btn" title="Cancel Order" onClick={() => { setCancelingSaleId(sale.id); setShowCancelModal(true); showToast('Cancel Order'); }}>❌</button>
                  </>
                )}
                {sale.status === 'to receive' && (
                  <button className="icon-btn" title="Mark as Completed" onClick={async () => { await updateStatus(sale.id, 'completed'); window.dispatchEvent(new Event('order-status-updated')); setStatusTab('completed'); showToast('Marked as Completed'); }}>✅</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === Cancel Modal === */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>❌ Cancel Order</h3>
            <textarea placeholder="Reason for cancellation" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="modal-actions">
              <button onClick={() => setShowCancelModal(false)}>Close</button>
              <button className="checkout-button cancel" onClick={async () => {
                if (!cancelReason.trim()) return alert('Please enter a reason');
                try {
                  await axios.put(`http://localhost:5000/sales/${cancelingSaleId}/status`, { status: 'cancelled', reason: cancelReason, cancelled_by: user.id });
                  setShowCancelModal(false); setCancelReason(''); setCancelingSaleId(null); fetchSales();
                } catch { alert('Failed to cancel order'); }
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* === Receipt Popup === */}
      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal-content fancy-receipt" onClick={(e) => e.stopPropagation()}>
            <div id="receipt-content">
              <h2>Oscar D’Gr8 Sales Receipt</h2>
              <p><strong>Receipt ID:</strong> #{selectedSale.id}</p>
              <p><strong>Customer:</strong> {selectedSale.customer_name || 'N/A'}</p>
              <p><strong>Contact:</strong> {selectedSale.contact || 'N/A'}</p>
              <p><strong>Payment:</strong> {selectedSale.payment_method}</p>
              <p><strong>Status:</strong> {selectedSale.status}</p>
              <p><strong>Date:</strong> {new Date(selectedSale.created_at).toLocaleString()}</p>
              <table className="receipt-items">
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {selectedSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <img src={item.variant_image} alt={item.variant_name} style={{ width: '40px', height: '40px', marginRight: '6px', objectFit: 'cover', verticalAlign: 'middle' }} />
                        {item.variant_name || item.name}
                      </td>
                      <td>{item.quantity}</td>
                      <td>₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td>₱{(item.quantity * item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan="3">Total</td><td>₱{Number(selectedSale.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr></tfoot>
              </table>
            </div>
            <div className="modal-actions">
              <button className="print-btn" onClick={handlePrint}>🖨️ Print</button>
              <button className="close-btn" onClick={() => setSelectedSale(null)}>❌ Close</button>
            </div>
          </div>
        </div>
      )}

      {/* === Receipt Image Popup === */}
      {showReceiptPopup && (
        <div className="modal-overlay" onClick={() => setShowReceiptPopup(false)}>
          <div className="modal-content">
            <button onClick={() => setShowReceiptPopup(false)}>❌</button>
            <img src={selectedReceiptUrl} alt="Attached Receipt" />
          </div>
        </div>
      )}

      {/* === Toast === */}
      {toastMsg && <div className="quick-toast">{toastMsg}...</div>}
    </div>
  );
}

export default SalesDashboard;
