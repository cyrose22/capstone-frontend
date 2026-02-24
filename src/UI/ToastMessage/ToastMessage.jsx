import React, { useEffect } from 'react';

function ToastMessage({ message, type, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeColors = {
    success: { background: '#4caf50', icon: '✅' },
    error: { background: '#f44336', icon: '❌' },
    warning: { background: '#ff9800', icon: '⚠️' },
    info: { background: '#2196f3', icon: 'ℹ️' },
  };

  const { background, icon } = typeColors[type] || typeColors.info;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background,
        color: '#fff',
        padding: '10px 16px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 9999,
        minWidth: '220px',
        fontFamily: 'sans-serif',
        animation: 'toastFadeInUp 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ flex: '1' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          lineHeight: '1',
        }}
      >
        ×
      </button>
      <style>
        {`
          @keyframes toastFadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default ToastMessage;
