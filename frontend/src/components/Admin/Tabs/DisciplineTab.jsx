import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { StorageManager } from '../../../utils/storage';
import { AddChallengeModal } from '../../Modals/AddChallengeModal';
import {
  IconTrophy,
  IconRefresh,
  IconMedal,
  IconShield,
  IconLightning,
  IconUsers,
  IconTarget,
  IconCalendar,
  IconFlame,
  IconPlus,
  IconTrash
} from '../../Common/AppIcons';

export function DisciplineTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    setChallenges(StorageManager.getChallenges());
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDisciplineData();
      setData(res);
      setChallenges(StorageManager.getChallenges());
    } catch (err) {
      console.error('Failed to load discipline data:', err);
      setError(err.message || "Intizom ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = (newCh) => {
    StorageManager.addChallenge(newCh);
    setChallenges(StorageManager.getChallenges());
  };

  const handleDeleteChallenge = (id) => {
    if (window.confirm("Rostdan ham bu musobaqani tizimdan o'chirmoqchimisiz?")) {
      StorageManager.deleteChallenge(id);
      setChallenges(StorageManager.getChallenges());
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 12px auto' }}></div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Intizom ko'rsatkichlari hisoblanmoqda...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#f87171' }}>
        <span>⚠️ {error}</span>
      </div>
    );
  }

  const { leaderboard = [], overview = {} } = data || {};

  return (
    <div className="admin-discipline-tab">
      {/* Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}
      >
        <div className="admin-kpi-card">
          <span className="kpi-lbl">Jami Faol Odatlar</span>
          <span className="kpi-num text-blue" style={{ fontSize: '26px', marginTop: '6px' }}>
            {overview.totalHabits || 0} ta
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            O'rtacha har bir a'zoga: {overview.avgHabitsPerUser || 0} ta
          </span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-lbl">Bajarilgan Odatlar Soni</span>
          <span className="kpi-num text-emerald" style={{ fontSize: '26px', marginTop: '6px' }}>
            {overview.totalCompletions || 0} marta
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Platforma ochilganidan buyon
          </span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-lbl">Haftalik vs Oylik Bajarilish</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-accent)' }}>
              {overview.weeklyCompletions || 0}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>oxirgi 7 kunda</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Shu oyda: <strong>{overview.monthlyCompletions || 0}</strong> ta bajarildi
          </span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-lbl">Faollik Ko'rsatkichi</span>
          <span className="kpi-num text-amber" style={{ fontSize: '26px', marginTop: '6px' }}>
            {overview.activeRatePct || 0}%
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Kamida 1 marta odat bajarganlar
          </span>
        </div>
      </div>

      {/* Admin Challenge Management Section */}
      <div
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(182, 243, 107, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b6f36b'
              }}
            >
              <IconTarget size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Platforma Guruh Musobaqalari (Challenges)
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Barcha a'zolar qatnashadigan umumiy marafonlar va ligalar
              </span>
            </div>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={() => setIsChallengeModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <IconPlus size={16} />
            <span>Yangi Challenge Qo'shish</span>
          </button>
        </div>

        {challenges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Hozircha hech qanday musobaqa yaratilmagan. Yuqoridagi tugma orqali yangi challenge yarating.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '12px'
            }}
          >
            {challenges.map((ch) => (
              <div
                key={ch.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{ch.emoji || '🎯'}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteChallenge(ch.id)}
                      title="Challengeni o'chirish"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    {ch.title}
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                    {ch.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconCalendar size={12} color="var(--primary-accent)" />
                    {ch.targetDays || 30} kunlik
                  </span>
                  <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                    {ch.badgeName || '🏆 Mukofot'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconTrophy size={18} color="#F59E0B" />
              Eng Intizomli Foydalanuvchilar Reytingi
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Haqiqiy bajarilgan odatlar soni va faol kunlar bo'yicha saralangan
            </span>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadData}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <IconRefresh size={13} />
            <span>Yangilash</span>
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Hozircha odatlar faolligi qayd etilmagan
          </div>
        ) : (
          <table className="admin-users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', width: '60px' }}>O'rin</th>
                <th style={{ padding: '12px 16px' }}>Foydalanuvchi</th>
                <th style={{ padding: '12px 16px' }}>Telefon</th>
                <th style={{ padding: '12px 16px' }}>Rol</th>
                <th style={{ padding: '12px 16px' }}>Faol Odatlar</th>
                <th style={{ padding: '12px 16px' }}>Faol Kunlar</th>
                <th style={{ padding: '12px 16px' }}>Jami Bajarilgan</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Haftalik Intizom</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, idx) => {
                const rank = idx + 1;
                const initials = item.name ? item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: rank <= 3 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      {rank <= 3 ? (
                        <IconMedal rank={rank} size={22} />
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>
                          #{rank}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: item.avatarGradient || 'var(--primary-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#fff',
                            flexShrink: 0
                          }}
                        >
                          {initials}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {item.phone}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {item.role === 'admin' ? (
                        <span className="user-role-badge role-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconShield size={12} color="#10B981" /> ADMIN
                        </span>
                      ) : item.role === 'premium' ? (
                        <span className="user-role-badge role-premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconLightning size={12} color="#F59E0B" /> PRO
                        </span>
                      ) : (
                        <span className="user-role-badge role-user" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconUsers size={12} color="var(--text-muted)" /> ODDIY
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <IconTarget size={13} color="var(--primary-accent)" />
                        {item.habitsCount} ta
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <IconCalendar size={13} color="#60A5FA" />
                        {item.activeDays} kun
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#10b981',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <IconFlame size={14} />
                        {item.totalCompletions} marta
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '60px',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${item.completionRate}%`,
                              height: '100%',
                              background: item.completionRate > 60 ? 'var(--primary-accent)' : '#f59e0b',
                              borderRadius: '3px'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {item.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onSave={handleCreateChallenge}
      />
    </div>
  );
}
