import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import {
  IconAuditShield,
  IconShield,
  IconRefresh,
  IconPlus,
  IconEdit,
  IconBan,
  IconTrash,
  IconMegaphone
} from '../../Common/AppIcons';

export function AuditLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const list = await adminService.getAuditLogs();
      setLogs(list || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (filterAction === 'all') return true;
    return l.action === filterAction;
  });

  const getActionBadge = (action) => {
    switch (action) {
      case 'user_created':
        return { label: 'Foydalanuvchi yaratildi', icon: <IconPlus size={12} />, bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
      case 'user_updated':
        return { label: 'Tahrirlandi', icon: <IconEdit size={12} />, bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' };
      case 'user_blocked':
        return { label: 'Bloklandi', icon: <IconBan size={12} />, bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      case 'user_unblocked':
        return { label: 'Qayta faollashtirildi', icon: <IconRefresh size={12} />, bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
      case 'user_deleted':
        return { label: "O'chirildi", icon: <IconTrash size={12} />, bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      case 'announcement_created':
        return { label: "E'lon yuborildi", icon: <IconMegaphone size={12} />, bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
      default:
        return { label: action, icon: null, bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="admin-audit-logs-tab">
      {/* Security Header Banner */}
      <div
        style={{
          padding: '18px 24px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex' }}>
            <IconAuditShield size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Xavfsizlik va Admin Harakatlari Tarixi (Audit Trail)
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Har bir muhim amal server-side darajasida qayd etiladi. Loglar o'zgarmas (Append-Only) rejimda saqlanadi.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="form-control"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
          >
            <option value="all">Barcha amallar</option>
            <option value="user_created">Foydalanuvchi yaratish</option>
            <option value="user_updated">Tahrirlash</option>
            <option value="user_blocked">Bloklash</option>
            <option value="user_unblocked">Faollashtirish</option>
            <option value="user_deleted">O'chirish</option>
            <option value="announcement_created">E'lon yuborish</option>
          </select>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadLogs}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <IconRefresh size={13} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        {loading && logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Audit loglar yuklanmoqda...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Hozircha audit yozuvlari mavjud emas
          </div>
        ) : (
          <table className="admin-users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Vaqt</th>
                <th style={{ padding: '12px 16px' }}>Bajaruvchi Admin</th>
                <th style={{ padding: '12px 16px' }}>Amal turi</th>
                <th style={{ padding: '12px 16px' }}>Obyekt / Target</th>
                <th style={{ padding: '12px 16px' }}>Tafsilotlar</th>
                <th style={{ padding: '12px 16px' }}>IP Manzil</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const b = getActionBadge(log.action);
                const timeStr = log.created_at
                  ? new Date(log.created_at).toLocaleString()
                  : 'Yaqinda';

                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {timeStr}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IconShield size={12} color="#10B981" /> {log.admin_name || 'Admin'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: b.bg,
                          color: b.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {b.icon}
                        {b.label}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <strong>{log.target_name || log.target_id || '—'}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                        Turi: {log.target_type}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {log.details && Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details).replace(/[{"}]/g, ' ')
                        : '—'}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-disabled)' }}>
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
