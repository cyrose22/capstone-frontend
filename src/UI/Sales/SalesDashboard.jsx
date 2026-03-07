import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './sales.css';
import Header from '../Header/Header';
import { useLocation } from 'react-router-dom';

function SalesDashboard() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [statusTab, setStatusTab] = useState('processing');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingSaleId, setCancelingSaleId] = useState(null);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [reportFilter, setReportFilter] = useState('all');
  const [reportDate, setReportDate] = useState('');
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');

  const itemsPerPage = 10;
  const location = useLocation();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.state?.status) {
      setStatusTab(location.state.status);
      setCurrentPage(1);
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
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert('Failed to load sales');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://capstone-backend-kiax.onrender.com/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert('Failed to load products');
    }
  };

  const updateStatus = async (saleId, status) => {
    try {
      await axios.put(`https://capstone-backend-kiax.onrender.com/sales/${saleId}/status`, {
        status,
      });
      await fetchSales();
    } catch (err) {
      console.error(err);
      alert('Failed to update sale status');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please enter a reason');
      return;
    }

    try {
      await axios.put(
        `https://capstone-backend-kiax.onrender.com/sales/${cancelingSaleId}/status`,
        {
          status: 'cancelled',
          reason: cancelReason,
          cancelled_by: user?.id,
        }
      );

      setShowCancelModal(false);
      setCancelReason('');
      setCancelingSaleId(null);
      await fetchSales();
      showToast('Order cancelled');
      window.dispatchEvent(new Event('order-status-updated'));
    } catch (err) {
      console.error(err);
      alert('Failed to cancel order');
    }
  };

  const handlePrint = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (!receiptContent) return;

    const style = `
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 24px;
          color: #111827;
        }
        .print-wrap {
          max-width: 900px;
          margin: 0 auto;
        }
        h2 {
          margin: 0 0 6px;
          font-size: 28px;
          color: #111827;
        }
        p {
          margin: 6px 0;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 18px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 10px 8px;
          text-align: left;
          vertical-align: middle;
          font-size: 13px;
        }
        th {
          background: #f8fafc;
        }
        img {
          width: 42px;
          height: 42px;
          object-fit: cover;
          border-radius: 8px;
          vertical-align: middle;
          margin-right: 8px;
        }
      </style>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Receipt</title>
          ${style}
        </head>
        <body>
          <div class="print-wrap">
            ${receiptContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => sale.status === statusTab);
  }, [sales, statusTab]);

  const completedSales = useMemo(() => {
    return sales.filter((sale) => sale.status === 'completed');
  }, [sales]);

  const totalSalesAmount = completedSales.reduce(
    (acc, sale) => acc + Number(sale.total || 0),
    0
  );

  const totalItemsSold = completedSales.reduce((acc, sale) => {
    const itemCount =
      sale.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
    return acc + itemCount;
  }, 0);

  const totalItemsLeft = products.reduce((acc, product) => {
    const variantsTotal =
      product.variants?.reduce(
        (sum, variant) => sum + Number(variant.quantity || 0),
        0
      ) || 0;

    return acc + variantsTotal;
  }, 0);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isSameDay = (date, selectedDate) => {
    const d = new Date(date);
    const s = new Date(selectedDate);

    return (
      d.getFullYear() === s.getFullYear() &&
      d.getMonth() === s.getMonth() &&
      d.getDate() === s.getDate()
    );
  };

  const isSameWeek = (date, selectedDate) => {
    const d = new Date(date);
    const s = new Date(selectedDate);

    const startOfWeek = new Date(s);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(s.getDate() - s.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return d >= startOfWeek && d <= endOfWeek;
  };

  const getFilteredCompletedSales = () => {
    return completedSales.filter((sale) => {
      const saleDate = new Date(sale.created_at);

      if (reportFilter === 'daily') {
        if (!reportDate) return false;
        return isSameDay(sale.created_at, reportDate);
      }

      if (reportFilter === 'weekly') {
        if (!reportDate) return false;
        return isSameWeek(sale.created_at, reportDate);
      }

      if (reportFilter === 'monthly') {
        if (!reportMonth) return false;
        const [year, month] = reportMonth.split('-');
        return (
          saleDate.getFullYear() === Number(year) &&
          saleDate.getMonth() + 1 === Number(month)
        );
      }

      if (reportFilter === 'yearly') {
        if (!reportYear) return false;
        return saleDate.getFullYear() === Number(reportYear);
      }

      return true;
    });
  };

  const handleGenerateReport = () => {
    const filteredReportSales = getFilteredCompletedSales();

    const filteredTotalSalesAmount = filteredReportSales.reduce(
      (acc, s) => acc + Number(s.total || 0),
      0
    );

    const filteredTotalItemsSold = filteredReportSales.reduce(
      (acc, s) => acc + (s.items?.reduce((sum, i) => sum + Number(i.quantity || 0), 0) || 0),
      0
    );

    const style = `
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #111827;
        }
        h1 {
          text-align: center;
          color: #111827;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 10px 8px;
          border: 1px solid #ddd;
          font-size: 13px;
          vertical-align: top;
        }
        th {
          background-color: #f8fafc;
        }
        .summary {
          margin-top: 20px;
          font-size: 14px;
          font-weight: bold;
          line-height: 1.7;
        }
        .meta {
          margin-bottom: 12px;
          color: #475569;
        }
      </style>
    `;

    const rows = filteredReportSales
      .map((sale) => {
        const itemDetails =
          sale.items
            ?.map((item) => `${item.variant_name || item.product_name} × ${item.quantity}`)
            .join(', ') || 'No items';

        return `
          <tr>
            <td>#${sale.id}</td>
            <td>${sale.customer_name || 'N/A'}</td>
            <td>${new Date(sale.created_at).toLocaleDateString()}</td>
            <td>${itemDetails}</td>
            <td>₱${Number(sale.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      })
      .join('');

    const filterLabel =
      reportFilter === 'daily'
        ? `Daily (${reportDate || 'No date selected'})`
        : reportFilter === 'weekly'
        ? `Weekly (${reportDate || 'No date selected'})`
        : reportFilter === 'monthly'
        ? `Monthly (${reportMonth || 'No month selected'})`
        : reportFilter === 'yearly'
        ? `Yearly (${reportYear || 'No year selected'})`
        : 'All Completed Sales';

    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          ${style}
        </head>
        <body>
          <h1>Oscar D’Gr8 Sales Report</h1>
          <div class="meta"><strong>Filter:</strong> ${filterLabel}</div>
          <div class="meta"><strong>Generated on:</strong> ${new Date().toLocaleString()}</div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows ||
                '<tr><td colspan="5">No completed sales found for this filter.</td></tr>'
              }
            </tbody>
          </table>

          <div class="summary">
            📊 Total Sales: ₱${filteredTotalSalesAmount.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
            })}<br/>
            🛍️ Total Items Sold: ${filteredTotalItemsSold}<br/>
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
        <div className="sd__topbar">
          <div className="sd__topbarLeft">
            <h2 className="sd__title">Sales Overview</h2>
            <p className="sd__subtitle">
              Monitor orders, update statuses, and print receipts.
            </p>
          </div>

          <div className="sd__topbarRight">
            <div className="sd__filters">
              <select
                className="sd__select"
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              {(reportFilter === 'daily' || reportFilter === 'weekly') && (
                <input
                  type="date"
                  className="sd__input"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              )}

              {reportFilter === 'monthly' && (
                <input
                  type="month"
                  className="sd__input"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                />
              )}

              {reportFilter === 'yearly' && (
                <input
                  type="number"
                  className="sd__input"
                  placeholder="Enter year"
                  value={reportYear}
                  onChange={(e) => setReportYear(e.target.value)}
                />
              )}

              <button className="sd__btn sd__btn--primary" onClick={handleGenerateReport}>
                📑 Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="sales-summary sd__summary">
          <div className="summary-box sd__summaryCard">
            <div className="sd__summaryMeta">
              <span className="sd__summaryLabel">💰 Total Sales</span>
              <span className="sd__summaryValue">
                ₱{totalSalesAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="summary-box sd__summaryCard">
            <div className="sd__summaryMeta">
              <span className="sd__summaryLabel">🛍️ Items Sold</span>
              <span className="sd__summaryValue">{totalItemsSold}</span>
            </div>
          </div>

          <div className="summary-box sd__summaryCard">
            <div className="sd__summaryMeta">
              <span className="sd__summaryLabel">📦 Items Left</span>
              <span className="sd__summaryValue">{totalItemsLeft}</span>
            </div>
          </div>
        </div>

        <div className="order-status-tabs sd__tabs">
          {['processing', 'to receive', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`sd__tab ${statusTab === status ? 'sd__tab--active' : ''}`}
              onClick={() => {
                setStatusTab(status);
                setCurrentPage(1);
              }}
            >
              {status === 'processing' && '⏳ Processing'}
              {status === 'to receive' && '📦 To Receive'}
              {status === 'completed' && '✅ Completed'}
              {status === 'cancelled' && '❌ Cancelled'}
            </button>
          ))}
        </div>

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
                    <div className="sd__orderDate">
                      {new Date(sale.created_at).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`status-tag sd__status ${
                      sale.status === 'processing'
                        ? 'status-processing'
                        : sale.status === 'to receive'
                        ? 'status-to-receive'
                        : sale.status === 'completed'
                        ? 'status-completed'
                        : 'status-cancelled'
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>

                <div className="stylish-body sd__cardBody">
                  <div className="sd__row">
                    <span className="sd__label">Customer: </span>
                    <span className="sd__value">{sale.customer_name || 'N/A'}</span>
                  </div>

                  <div className="sd__row">
                    <span className="sd__label">Contact: </span>
                    <span className="sd__value">{sale.contact || 'N/A'}</span>
                  </div>

                  <div className="sd__row">
                    <span className="sd__label">Payment: </span>
                    <span className="sd__value">{sale.payment_method || 'N/A'}</span>
                  </div>

                  <div className="sd__row">
                    <span className="sd__label">Total: </span>
                    <span className="sd__value">
                      ₱{Number(sale.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <strong className="sd__itemsTitle">Items</strong>
                  <ul className="sd__itemsList">
                    {sale.items?.map((item, idx) => (
                      <li key={idx} className="sd__item">
                        <img
                          src={item.variant_image || item.product_image}
                          alt={item.variant_name || item.product_name}
                          className="sd__itemImg"
                        />
                        <div className="sd__itemInfo">
                          <span className="sd__itemName">
                            {item.variant_name || item.product_name}
                          </span>
                          <span className="sd__itemSub">
                            Qty: {item.quantity} · ₱
                            {Number(item.price).toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {sale.status === 'cancelled' && sale.cancel_description && (
                    <div className="sd__cancelBox">
                      <div>
                        <strong>Reason:</strong> {sale.cancel_description}
                      </div>
                      {sale.cancelled_by_name && (
                        <div>
                          <strong>Cancelled by:</strong>{' '}
                          {sale.cancelled_by_role === 'admin'
                            ? 'Admin'
                            : sale.cancelled_by_name}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="card-actions sd__actions">
                  <button
                    className="sd__iconBtn"
                    title="View Receipt"
                    onClick={() => {
                      setSelectedSale(sale);
                      showToast('Viewing receipt');
                    }}
                  >
                    🧾
                  </button>

                  {sale.receipt_url && (
                    <button
                      className="sd__iconBtn sd__iconBtn--blue"
                      title="View Uploaded Receipt Image"
                      onClick={() => {
                        setSelectedReceiptUrl(sale.receipt_url);
                        setShowReceiptPopup(true);
                      }}
                    >
                      🖼️
                    </button>
                  )}

                  {sale.status === 'processing' && (
                    <>
                      <button
                        className="sd__iconBtn sd__iconBtn--blue"
                        title="Move to To Receive"
                        onClick={async () => {
                          await updateStatus(sale.id, 'to receive');
                          window.dispatchEvent(new Event('order-status-updated'));
                          showToast('Moved to To Receive');
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
                          showToast('Cancel order');
                        }}
                      >
                        ❌
                      </button>
                    </>
                  )}

                  {sale.status === 'to receive' && (
                    <button
                      className="sd__iconBtn sd__iconBtn--green"
                      title="Mark as Completed"
                      onClick={async () => {
                        await updateStatus(sale.id, 'completed');
                        window.dispatchEvent(new Event('order-status-updated'));
                        setStatusTab('completed');
                        showToast('Marked as completed');
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

        {filteredSales.length > 0 && totalPages > 1 && (
          <div className="sd__pagination">
            <button
              className="sd__btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="sd__pageText">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="sd__btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {showCancelModal && (
          <div
            className="modal-overlay sd__modalOverlay"
            onClick={() => setShowCancelModal(false)}
          >
            <div className="modal-content sd__modal" onClick={(e) => e.stopPropagation()}>
              <div className="sd__modalHeader">
                <h3>Cancel Order</h3>
                <button
                  className="sd__modalX"
                  onClick={() => setShowCancelModal(false)}
                  aria-label="Close"
                >
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

                <button className="sd__btn sd__btn--danger" onClick={handleCancelOrder}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedSale && (
          <div
            className="modal-overlay sd__modalOverlay"
            onClick={() => setSelectedSale(null)}
          >
            <div
              className="modal-content sd__modal sd__modal--invoice"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sd__invoiceTop">
                <div>
                  <div className="sd__invoiceChip">🧾 Receipt Preview</div>
                  <h3 className="sd__invoiceTitle">Sales Receipt</h3>
                  <p className="sd__invoiceSub">
                    Review order details before printing.
                  </p>
                </div>

                <button
                  className="sd__modalX"
                  onClick={() => setSelectedSale(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div id="receipt-content" className="sd__invoiceCard">
                <div className="sd__invoiceHeader">
                  <div>
                    <h2>Oscar D’Gr8</h2>
                    <p>Pet supplies and essentials</p>
                  </div>

                  <div className="sd__invoiceMeta">
                    <div>
                      <span>Receipt No.</span>
                      <strong>#{selectedSale.id}</strong>
                    </div>
                    <div>
                      <span>Date</span>
                      <strong>{new Date(selectedSale.created_at).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong className="sd__invoiceStatus">{selectedSale.status}</strong>
                    </div>
                  </div>
                </div>

                <div className="sd__invoiceInfoGrid">
                  <div className="sd__invoiceInfoBox">
                    <span>Customer</span>
                    <strong>{selectedSale.customer_name || 'N/A'}</strong>
                  </div>

                  <div className="sd__invoiceInfoBox">
                    <span>Contact</span>
                    <strong>{selectedSale.contact || 'N/A'}</strong>
                  </div>

                  <div className="sd__invoiceInfoBox">
                    <span>Payment Method</span>
                    <strong>{selectedSale.payment_method || 'N/A'}</strong>
                  </div>

                  <div className="sd__invoiceInfoBox">
                    <span>Total Amount</span>
                    <strong>
                      ₱
                      {Number(selectedSale.total).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>

                <div className="sd__invoiceItemsWrap">
                  <table className="sd__invoiceTable">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Variant</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="sd__invoiceItemCell">
                              <img
                                src={item.variant_image || item.product_image}
                                alt={item.variant_name || item.product_name}
                                className="sd__invoiceItemImg"
                              />
                              <div className="sd__invoiceItemText">
                                <strong>{item.product_name || 'Product'}</strong>
                              </div>
                            </div>
                          </td>
                          <td>{item.variant_name || 'Original'}</td>
                          <td>{item.quantity}</td>
                          <td>
                            ₱
                            {Number(item.price).toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td>
                            ₱
                            {(Number(item.quantity) * Number(item.price)).toLocaleString(
                              'en-PH',
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sd__invoiceFooter">
                  <div className="sd__invoiceNote">
                    Thank you for your purchase.
                  </div>

                  <div className="sd__invoiceTotalCard">
                    <span>Grand Total</span>
                    <strong>
                      ₱
                      {Number(selectedSale.total).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="sd__modalActions">
                <button className="sd__btn sd__btn--primary" onClick={handlePrint}>
                  🖨️ Print Receipt
                </button>
                <button className="sd__btn" onClick={() => setSelectedSale(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showReceiptPopup && (
          <div
            className="modal-overlay sd__modalOverlay"
            onClick={() => setShowReceiptPopup(false)}
          >
            <div className="modal-content sd__modal" onClick={(e) => e.stopPropagation()}>
              <div className="sd__modalHeader">
                <h3>Receipt Image</h3>
                <button
                  className="sd__modalX"
                  onClick={() => setShowReceiptPopup(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <img src={selectedReceiptUrl} alt="Attached Receipt" className="sd__receiptImg" />
            </div>
          </div>
        )}

        {toastMsg && <div className="quick-toast sd__toast">{toastMsg}</div>}
      </div>
    </div>
  );
}

export default SalesDashboard;