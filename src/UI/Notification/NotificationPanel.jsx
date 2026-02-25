import React, { useState, useEffect } from 'react';

function NotificationPanel({
  notifBounce,
  newStatusChanges,
  setNewStatusChanges,
  notifRef
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifRef]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        zIndex: 3000
      }}
      ref={notifRef}
    >
      {/* Bell Icon */}
      <div
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          position: 'relative',
          fontSize: '1.6rem',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: notifBounce ? 'bounce 1s infinite' : 'none'
        }}
      >
        🔔
        {newStatusChanges.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#ff3b30',
              color: '#fff',
              borderRadius: '50%',
              padding: '3px 6px',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}
          >
            {newStatusChanges.length}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {showNotifications && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '48px',
            width: '320px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            zIndex: 4000,
            overflow: 'hidden',
            animation: 'fadeDown 0.2s ease'
          }}
        >
          <h4
            style={{
              margin: 0,
              padding: '0.9rem',
              borderBottom: '1px solid #eee',
              fontWeight: 600
            }}
          >
            Order Notifications
          </h4>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {newStatusChanges.length > 0 ? (
              newStatusChanges.map((change, index) => (
                <div
                  key={`${change.id}-${change.status}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.9rem',
                    borderBottom: '1px solid #f2f2f2',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '1.3rem' }}>
                    {change.status === 'processing' && '⏳'}
                    {change.status === 'to receive' && '📦'}
                    {change.status === 'cancelled' && '❌'}
                    {change.status === 'completed' && '✅'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <strong>Order #{change.id}</strong>

                    {change.status === 'processing' && (
                      <p style={{ margin: '0.3rem 0' }}>
                        has been <strong>processed</strong>. Waiting for admin confirmation.
                      </p>
                    )}

                    {change.status === 'to receive' && (
                      <p style={{ margin: '0.3rem 0' }}>
                        has been moved to <strong>To Receive</strong>. Get ready to receive your order.
                      </p>
                    )}

                    {change.status === 'completed' && (
                      <p style={{ margin: '0.3rem 0' }}>
                        has been <strong>Completed</strong>. Thank you for shopping with us!
                      </p>
                    )}

                    {change.status === 'cancelled' && (
                      <p style={{ margin: '0.3rem 0' }}>
                        was <strong>Cancelled</strong> by{' '}
                        <strong>
                          {change.cancelledByRole === 'admin'
                            ? 'Admin'
                            : change.cancelledByName}
                        </strong>. 
                        You may check the reason in order history.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setNewStatusChanges((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      color: '#aaa'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p style={{ padding: '1.2rem', textAlign: 'center', color: '#888' }}>
                No recent status changes
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;