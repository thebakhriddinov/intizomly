import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import {
  IconRefresh,
  IconUsers,
  IconLightning,
  IconFlame,
  IconDiamond,
  IconShield,
  IconTarget,
  IconCalendar
} from '../../Common/AppIcons';

export function AnalyticsTab({ onNavigateToUsers }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sana oralig'i: 'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom'
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats({
        dateRange,
        startDate: customStart,
        endDate: customEnd
      });
      setStats(data);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err.message || "Statistikalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [dateRange, customStart, customEnd]);

  // SVG Grafiklarni chizish hisob-kitoblari
  const growthPoints = stats?.growthPoints || [];

  const maxUsersVal = useMemo(() => {
    if (growthPoints.length === 0) return 10;
    const max = Math.max(...growthPoints.map(p => p.totalUsers || 0));
    return max > 0 ? max : 10;
  }, [growthPoints]);

  const maxCompletionsVal = useMemo(() => {
    if (growthPoints.length === 0) return 10;
    const max = Math.max(...growthPoints.map(p => p.completions || 0));
    return max > 0 ? max : 10;
  }, [growthPoints]);

  if (loading && !stats) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Ma'lumotlar bazasidan statistika hisoblanmoqda...
        </span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div
        style={{
          padding: '30px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          textAlign: 'center',
          color: '#f87171'
        }}
      >
        <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>⚠️</span>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>Xatolik yuz berdi</h4>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{error}</p>
        <button type="button" className="secondary-btn" onClick={loadStats}>
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="admin-analytics-tab">
      {/* Date Range Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <IconCalendar size={13} color="var(--text-muted)" /> Sana oralig'i:
          </span>
          {[
            { id: 'all', label: 'Barcha davr' },
            { id: 'today', label: 'Bugun' },
            { id: '7days', label: '7 kun' },
            { id: '30days', label: '30 kun' },
            { id: 'this_month', label: 'Shu oy' },
            { id: 'custom', label: 'Oraliq...' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDateRange(tab.id)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dateRange === tab.id ? 'var(--primary-accent)' : 'rgba(255, 255, 255, 0.05)',
                color: dateRange === tab.id ? '#080d05' : 'var(--text-secondary)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              className="form-control"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)' }}>—</span>
            <input
              type="date"
              className="form-control"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}

        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
          title="Ma'lumotlarni yangilash"
        >
          <IconRefresh size={14} className={loading ? 'spin-anim' : ''} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}
      >
        {/* Total Users */}
        <div
          className="admin-kpi-card"
          onClick={onNavigateToUsers}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-lbl">Jami A'zolar</span>
            <div style={{ padding: '4px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', display: 'flex' }}>
              <IconUsers size={16} />
            </div>
          </div>
          <span className="kpi-num text-blue" style={{ fontSize: '28px', marginTop: '6px' }}>
            {stats?.totalUsers || 0}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tizimdagi barcha profillar
          </span>
        </div>

        {/* New Registrations */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-lbl">Yangi Ro'yxatdan O'tganlar</span>
            <div style={{ padding: '4px', borderRadius: '8px', background: 'rgba(182, 243, 107, 0.12)', color: '#b6f36b', display: 'flex' }}>
              <IconLightning size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span className="kpi-num" style={{ fontSize: '28px', color: 'var(--primary-accent)' }}>
              +{stats?.registeredToday || 0}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>bugun</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Hafta: <strong>+{stats?.registeredThisWeek || 0}</strong> &bull; Oy: <strong>+{stats?.registeredThisMonth || 0}</strong>
          </span>
        </div>

        {/* DAU & MAU */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-lbl">Faol Foydalanuvchilar</span>
            <div style={{ padding: '4px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex' }}>
              <IconTarget size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
            <div>
              <span className="kpi-num text-emerald" style={{ fontSize: '24px' }}>
                {stats?.dau || 0}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>DAU (Bugun)</span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
              <span className="kpi-num text-blue" style={{ fontSize: '24px' }}>
                {stats?.mau || 0}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>MAU (30 kun)</span>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Haqiqiy odat bajargan a'zolar
          </span>
        </div>

        {/* Total Habits & Completions */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-lbl">Intizom Bajarilishi</span>
            <div style={{ padding: '4px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex' }}>
              <IconFlame size={16} />
            </div>
          </div>
          <span className="kpi-num text-emerald" style={{ fontSize: '28px', marginTop: '6px' }}>
            {stats?.totalCompletions || 0}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Jami {stats?.totalHabits || 0} ta odat bo'yicha
          </span>
        </div>

        {/* PRO vs Regular */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-lbl">Obunalar Taqsimoti</span>
            <div style={{ padding: '4px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex' }}>
              <IconDiamond size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--liquid-amber)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <IconLightning size={12} color="#f59e0b" /> PRO: {stats?.premiumUsers || 0}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <IconUsers size={12} color="var(--text-muted)" /> Oddiy: {stats?.regularUsers || 0}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <IconShield size={11} color="#10b981" /> Admin: {stats?.adminUsers || 0} {stats?.blockedUsers > 0 && `(${stats.blockedUsers} bloklangan)`}
          </span>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Chart 1: User Growth Timeline */}
        <div
          style={{
            padding: '20px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconTarget size={16} color="#3b82f6" />
                Foydalanuvchilar O'sishi Dinamikasi
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Vaqt bo'yicha jami va yangi qo'shilgan a'zolar
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                fontWeight: 600
              }}
            >
              Haqiqiy DB
            </span>
          </div>

          {growthPoints.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Grafik uchun yetarli ma'lumot mavjud emas
            </div>
          ) : (
            <div style={{ width: '100%', height: '180px', position: 'relative' }}>
              <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={160 - pct * 140}
                    x2="500"
                    y2={160 - pct * 140}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Growth Path */}
                {(() => {
                  const n = growthPoints.length;
                  if (n < 2) return null;
                  const pts = growthPoints.map((pt, idx) => {
                    const x = (idx / (n - 1)) * 480 + 10;
                    const y = 160 - ((pt.totalUsers || 0) / maxUsersVal) * 140;
                    return { x, y, pt };
                  });

                  const pathD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
                  const areaD = `${pathD} L ${pts[pts.length - 1].x} 160 L ${pts[0].x} 160 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#userGrowthGrad)" />
                      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                      {pts.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                        </g>
                      ))}
                    </>
                  );
                })()}

                {/* X Axis Labels */}
                {growthPoints.map((pt, idx) => {
                  if (idx % 2 !== 0 && growthPoints.length > 8) return null;
                  const x = (idx / (growthPoints.length - 1 || 1)) * 480 + 10;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y="176"
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9"
                    >
                      {pt.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Chart 2: Habit Completions Activity */}
        <div
          style={{
            padding: '20px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconFlame size={16} />
                Kunlik Bajarilgan Odatlar Faolligi
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Foydalanuvchilarning kundalik intizom ko'rsatkichi
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontWeight: 600
              }}
            >
              Completions
            </span>
          </div>

          {growthPoints.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Grafik uchun yetarli ma'lumot mavjud emas
            </div>
          ) : (
            <div style={{ width: '100%', height: '180px', position: 'relative' }}>
              <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="completionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={160 - pct * 140}
                    x2="500"
                    y2={160 - pct * 140}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                  />
                ))}

                {(() => {
                  const n = growthPoints.length;
                  if (n < 2) return null;
                  const pts = growthPoints.map((pt, idx) => {
                    const x = (idx / (n - 1)) * 480 + 10;
                    const y = 160 - ((pt.completions || 0) / maxCompletionsVal) * 140;
                    return { x, y, pt };
                  });

                  const pathD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
                  const areaD = `${pathD} L ${pts[pts.length - 1].x} 160 L ${pts[0].x} 160 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#completionsGrad)" />
                      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                      {pts.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                        </g>
                      ))}
                    </>
                  );
                })()}

                {growthPoints.map((pt, idx) => {
                  if (idx % 2 !== 0 && growthPoints.length > 8) return null;
                  const x = (idx / (growthPoints.length - 1 || 1)) * 480 + 10;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y="176"
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9"
                    >
                      {pt.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
