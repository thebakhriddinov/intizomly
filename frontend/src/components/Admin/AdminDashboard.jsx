import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { AnalyticsTab } from './Tabs/AnalyticsTab';
import { UsersTab } from './Tabs/UsersTab';
import { DisciplineTab } from './Tabs/DisciplineTab';
import { AnnouncementsTab } from './Tabs/AnnouncementsTab';
import { ReportsTab } from './Tabs/ReportsTab';
import { AuditLogsTab } from './Tabs/AuditLogsTab';
import { VideosTab } from './Tabs/VideosTab';

import {
  IconAnalytics,
  IconUsers,
  IconLightning,
  IconVideo,
  IconMegaphone,
  IconDocumentCsv,
  IconAuditShield,
  IconShield
} from '../Common/AppIcons';

export function AdminDashboard({ onClose }) {
  const { currentUser, isAdmin } = useAuth();
  const { addToast } = useHabits();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'discipline' | 'videos' | 'announcements' | 'reports' | 'audit'

  if (!isAdmin) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#f87171' }}>
        <h3>Kirish taqiqlangan</h3>
        <p>Ushbu boshqaruv panelidan faqat administratorlar foydalana oladi.</p>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Analitika', icon: <IconAnalytics size={16} />, desc: 'KPI va dinamika' },
    { id: 'users', label: 'Foydalanuvchilar', icon: <IconUsers size={16} />, desc: 'Boshqaruv va qidiruv' },
    { id: 'discipline', label: 'Intizom & Musobaqalar', icon: <IconLightning size={16} />, desc: 'Odatlar va challengelar' },
    { id: 'videos', label: 'Videolar', icon: <IconVideo size={16} />, desc: 'YouTube boshqaruv' },
    { id: 'announcements', label: "E'lonlar", icon: <IconMegaphone size={16} />, desc: 'Bildirishnomalar' },
    { id: 'reports', label: 'Hisobotlar (CSV)', icon: <IconDocumentCsv size={16} />, desc: 'Eksport' },
    { id: 'audit', label: 'Audit Log', icon: <IconAuditShield size={16} />, desc: 'Xavfsizlik' }
  ];

  return (
    <div
      className="admin-dashboard-container"
      style={{
        width: '100%',
        minHeight: '100%',
        paddingBottom: '40px'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px',
          borderRadius: '24px',
          background: 'rgba(18, 25, 38, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}
          >
            <IconShield size={24} color="#10B981" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                Intizomly Boshqaruv Paneli
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(182, 243, 107, 0.15)',
                  color: 'var(--primary-accent)',
                  border: '1px solid rgba(182, 243, 107, 0.3)'
                }}
              >
                PRO ADMIN
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Tizim holati, a'zolar, intizom analitikasi va xavfsizlik nazorati
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>&times;</span>
            <span>Panelni Yopish</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '6px',
          marginBottom: '20px',
          scrollbarWidth: 'none'
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '14px',
                border: isActive ? '1px solid var(--primary-accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive ? 'rgba(182, 243, 107, 0.12)' : 'rgba(18, 25, 38, 0.65)',
                color: isActive ? 'var(--primary-accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)' }}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </div>
              <span style={{ fontSize: '10px', opacity: isActive ? 0.9 : 0.6, fontWeight: 400 }}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="admin-tab-content">
        {activeTab === 'analytics' && (
          <AnalyticsTab onNavigateToUsers={() => setActiveTab('users')} />
        )}

        {activeTab === 'users' && (
          <UsersTab onShowToast={(title, desc, type) => addToast(title, desc, type)} />
        )}

        {activeTab === 'discipline' && (
          <DisciplineTab />
        )}

        {activeTab === 'videos' && (
          <VideosTab onShowToast={(title, desc, type) => addToast(title, desc, type)} />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab onShowToast={(title, desc, type) => addToast(title, desc, type)} />
        )}

        {activeTab === 'reports' && (
          <ReportsTab onShowToast={(title, desc, type) => addToast(title, desc, type)} />
        )}

        {activeTab === 'audit' && (
          <AuditLogsTab />
        )}
      </div>
    </div>
  );
}
