import React from 'react';

export default function ToastNotification({ show, message, type, onClose }) {
  if (!show) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? '#059669' : '#dc2626';

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div 
        className="toast show align-items-center text-white border-0 shadow-lg rounded-3 p-2" 
        style={{ backgroundColor: bgColor, minWidth: '280px' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold">{isSuccess ? '✓' : '✕'}</span>
            <span className="small fw-semibold">{message}</span>
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white opacity-75" 
            onClick={onClose}
          ></button>
        </div>
      </div>
    </div>
  );
}