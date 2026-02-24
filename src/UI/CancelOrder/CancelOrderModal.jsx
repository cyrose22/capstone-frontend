import React, { useState } from 'react';
import axios from 'axios';

function CancelOrderModal({
  saleToCancel,
  user,
  products,
  enrichSalesWithImages,
  setSalesHistory,
  onClose
}) {
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please enter a reason');
      return;
    }

    try {
      setSubmitting(true);

      // Always fallback to saleId if id is missing
      const saleId = saleToCancel?.id || saleToCancel?.saleId;
      if (!saleId) throw new Error("Sale ID is missing");

      await axios.put(`http://localhost:5000/sales/${saleId}/status`, {
        status: 'cancelled',
        reason: cancelReason,
        cancelled_by: user.id,
      });

      // Refresh sales
      const updated = await axios.get(`http://localhost:5000/sales/user/${user.id}`);
      setSalesHistory(enrichSalesWithImages(updated.data, products));

      onClose();
    } catch (error) {
      console.error('Cancel order failed:', error.response || error.message || error);
      alert('Failed to cancel order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '450px',
          backgroundColor: '#fff',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      >
        <h3 style={{ color: '#e53935', marginBottom: '1rem' }}>
          ❌ Cancel Order #{saleToCancel?.id || saleToCancel?.saleId}
        </h3>
        <p>Please provide a reason for cancellation:</p>

        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation"
          style={{
            width: '100%',
            minHeight: '80px',
            margin: '1rem 0',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #ccc',
            fontFamily: 'inherit',
            resize: 'none'
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: '#ccc',
              color: '#333',
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          <button
            onClick={handleConfirmCancel}
            disabled={submitting}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: '#e53935',
              color: '#fff',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Cancelling...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelOrderModal;
