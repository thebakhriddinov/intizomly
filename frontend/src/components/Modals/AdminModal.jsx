import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from '../Admin/AdminDashboard';

export function AdminModal({ isOpen, onClose }) {
  const { currentUser, isAdmin, refreshUsers } = useAuth();

  useEffect(() => {
    if (isOpen && refreshUsers) {
      refreshUsers();
    }
  }, [isOpen, refreshUsers]);

  if (!isOpen || !isAdmin) return null;

  return (
    <div
      className="modal-overlay admin-fullscreen-overlay"
      onClick={onClose}
      style={{
        zIndex: 1000,
        padding: '20px',
        alignItems: 'flex-start',
        overflowY: 'auto'
      }}
    >
      <div
        className="modal-card admin-dashboard-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '20px auto',
          background: 'rgba(12, 17, 26, 0.94)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '28px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.15)',
          padding: '24px',
          maxHeight: 'none'
        }}
      >
        <AdminDashboard onClose={onClose} />
      </div>
    </div>
  );
}
