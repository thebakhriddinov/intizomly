import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';
import { UserFormModal } from '../Modals/UserFormModal';
import { UserDetailsModal } from '../Modals/UserDetailsModal';
import { ConfirmActionModal } from '../Modals/ConfirmActionModal';
import {
  IconSearch,
  IconDocumentCsv,
  IconPlus,
  IconShield,
  IconLightning,
  IconUsers,
  IconTarget,
  IconFlame,
  IconEye,
  IconEyeOff,
  IconEdit,
  IconTrash,
  IconBan,
  IconRefresh
} from '../../Common/AppIcons';

export function UsersTab({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [allFilteredUsers, setAllFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const toggleRevealPassword = (userId) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Filters, search, pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDanger: false,
    action: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsersWithMeta({
        search,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page,
        limit
      });

      setUsers(res.users);
      setAllFilteredUsers(res.allFilteredUsers);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || "Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Yangi foydalanuvchi yaratish yoki tahrirlash
  const handleSaveUser = async (formData) => {
    setFormLoading(true);
    try {
      if (userToEdit) {
        await adminService.updateUser(userToEdit.id, formData);
        onShowToast?.("Muvaffaqiyatli! ✅", "Foydalanuvchi ma'lumotlari yangilandi", "success");
      } else {
        await adminService.createUser(formData);
        onShowToast?.("Yaratildi! 👤", "Yangi foydalanuvchi tizimga qo'shildi", "success");
      }
      setFormModalOpen(false);
      setUserToEdit(null);
      loadUsers();
    } catch (err) {
      onShowToast?.("Xatolik", err.message || "Amalni bajarib bo'lmadi", "warning");
    } finally {
      setFormLoading(false);
    }
  };

  // Bloklash / Qayta faollashtirish tasdiqlash
  const handlePromptToggleBlock = (targetUser) => {
    const isBlocked = targetUser.status === 'blocked';
    setConfirmModal({
      isOpen: true,
      title: isBlocked ? "Akkauntni qayta faollashtirish" : "Akkauntni bloklash",
      message: isBlocked
        ? `"${targetUser.firstName} ${targetUser.lastName}" akkaunti qayta ochilsinmi? Foydalanuvchi yana tizimga kirishi mumkin bo'ladi.`
        : `"${targetUser.firstName} ${targetUser.lastName}" akkaunti bloklansinmi? Supabase Auth orqali ushbu akkauntning tizimga kirishi to'xtatiladi.`,
      confirmText: isBlocked ? "Faollashtirish" : "Ha, Bloklash",
      isDanger: !isBlocked,
      action: async () => {
        setConfirmLoading(true);
        try {
          if (isBlocked) {
            await adminService.unblockUser(targetUser.id);
            onShowToast?.("Faollashtirildi! 🟢", `${targetUser.firstName} yana tizimdan foydalanishi mumkin`, "success");
          } else {
            await adminService.blockUser(targetUser.id);
            onShowToast?.("Bloklandi! 🔴", `${targetUser.firstName} akkaunti cheklandi`, "warning");
          }
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          loadUsers();
        } catch (err) {
          onShowToast?.("Xatolik", err.message || "Bloklashda xatolik yuz berdi", "warning");
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  // O'chirish tasdiqlash
  const handlePromptDelete = (targetUser) => {
    setConfirmModal({
      isOpen: true,
      title: "Foydalanuvchini butunlay o'chirish",
      message: `"${targetUser.firstName} ${targetUser.lastName}" akkauntini butunlay o'chirib yuborishni tasdiqlaysizmi? Bu amal qaytarilmaydi va barcha odatlar ham o'chib ketadi!`,
      confirmText: "Ha, O'chirish",
      isDanger: true,
      action: async () => {
        setConfirmLoading(true);
        try {
          await adminService.deleteUser(targetUser.id);
          onShowToast?.("O'chirildi! 🗑️", `${targetUser.firstName} tizimdan olib tashlandi`, "info");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          loadUsers();
        } catch (err) {
          onShowToast?.("Xatolik", err.message || "O'chirishda xatolik", "warning");
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  // CSV eksport
  const handleExportCSV = () => {
    try {
      adminService.exportUsersToCSV(allFilteredUsers.length > 0 ? allFilteredUsers : users);
      onShowToast?.("Yuklab olindi! 📥", "Foydalanuvchilar ro'yxati CSV faylga eksport qilindi", "success");
    } catch (e) {
      onShowToast?.("Xatolik", e.message, "warning");
    }
  };

  return (
    <div className="admin-users-tab">
      {/* Top Controls: Search, Filters, Add Button, Export */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconSearch size={14} color="var(--text-muted)" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Ism, familiya yoki telefon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px', fontSize: '13px', borderRadius: '12px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-control"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '10px', width: 'auto' }}
          >
            <option value="all">Barcha Rollar</option>
            <option value="user">Oddiy A'zolar</option>
            <option value="premium">PRO A'zolar</option>
            <option value="admin">Administratorlar</option>
          </select>

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '10px', width: 'auto' }}
          >
            <option value="all">Barcha Holatlar</option>
            <option value="active">Faol</option>
            <option value="blocked">Bloklangan</option>
          </select>

          <select
            className="form-control"
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_');
              setSortBy(sb);
              setSortOrder(so);
            }}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '10px', width: 'auto' }}
          >
            <option value="createdAt_desc">Yangi ro'yxatdan o'tganlar</option>
            <option value="createdAt_asc">Eski ro'yxatdan o'tganlar</option>
            <option value="firstName_asc">Ism bo'yicha (A-Z)</option>
            <option value="habitsCount_desc">Ko'p odatlilar</option>
            <option value="completionsCount_desc">Ko'p bajarganlar</option>
          </select>
        </div>

        {/* Buttons: Export & Add User */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleExportCSV}
            style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="CSV yuklab olish"
          >
            <IconDocumentCsv size={15} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setUserToEdit(null);
              setFormModalOpen(true);
            }}
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <IconPlus size={15} />
            <span>Yangi Foydalanuvchi</span>
          </button>
        </div>
      </div>

      {/* Main Users Table */}
      <div
        className="admin-table-wrapper"
        style={{
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        {loading && users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 12px auto' }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Foydalanuvchilar yuklanmoqda...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#f87171' }}>
            <span>⚠️ {error}</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Qidiruv yoki filtr bo'yicha hech qanday foydalanuvchi topilmadi
          </div>
        ) : (
          <table className="admin-users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Foydalanuvchi</th>
                <th style={{ padding: '12px 16px' }}>Telefon</th>
                <th style={{ padding: '12px 16px' }}>Parol</th>
                <th style={{ padding: '12px 16px' }}>Rol</th>
                <th style={{ padding: '12px 16px' }}>Holat</th>
                <th style={{ padding: '12px 16px' }}>Odatlar / Bajarilgan</th>
                <th style={{ padding: '12px 16px' }}>Qo'shilgan</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isAdm = u.role === 'admin';
                const isPrem = u.role === 'premium';
                const isBlocked = u.status === 'blocked';
                const initials = `${u.firstName?.[0] || 'U'}${u.lastName?.[0] || ''}`.toUpperCase();

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s',
                      opacity: isBlocked ? 0.75 : 1
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => {
                          setUserToView(u);
                          setDetailsModalOpen(true);
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: u.avatarGradient || 'var(--primary-accent)',
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
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>
                            {u.firstName} {u.lastName}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ID: {u.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {u.formattedPhone}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            fontWeight: revealedPasswords[u.id] ? 700 : 400,
                            letterSpacing: revealedPasswords[u.id] ? '0.04em' : '0.15em',
                            color: revealedPasswords[u.id] ? '#B6F36B' : 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            userSelect: 'all'
                          }}
                        >
                          {revealedPasswords[u.id] ? (u.password || 'user123') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => toggleRevealPassword(u.id)}
                          title={revealedPasswords[u.id] ? "Parolni yashirish" : "Parolni ko'rsatish"}
                          style={{
                            padding: '4px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: revealedPasswords[u.id] ? '#B6F36B' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {revealedPasswords[u.id] ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {isAdm ? (
                        <span className="user-role-badge role-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconShield size={12} color="#10B981" /> ADMIN
                        </span>
                      ) : isPrem ? (
                        <span className="user-role-badge role-premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconLightning size={12} color="#F59E0B" /> PRO
                        </span>
                      ) : (
                        <span className="user-role-badge role-user" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconUsers size={12} color="var(--text-muted)" /> ODDIY
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {isBlocked ? (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <IconBan size={12} color="#ef4444" /> Bloklangan
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Faol
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IconTarget size={12} color="var(--primary-accent)" /> {u.habitsCount} ta
                      </span>{' '}
                      &bull;{' '}
                      <strong style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IconFlame size={12} /> {u.completionsCount}
                      </strong>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {u.createdAt}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {/* View Details */}
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => {
                            setUserToView(u);
                            setDetailsModalOpen(true);
                          }}
                          title="Profilni ko'rish"
                          style={{ padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                        >
                          <IconEye size={15} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => {
                            setUserToEdit(u);
                            setFormModalOpen(true);
                          }}
                          title="Tahrirlash"
                          style={{ padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                        >
                          <IconEdit size={15} />
                        </button>

                        {/* Block / Unblock */}
                        {!isAdm && (
                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={() => handlePromptToggleBlock(u)}
                            title={isBlocked ? "Faollashtirish" : "Bloklash"}
                            style={{
                              padding: '6px',
                              borderRadius: '8px',
                              color: isBlocked ? '#10b981' : '#f59e0b',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {isBlocked ? <IconRefresh size={15} /> : <IconBan size={15} />}
                          </button>
                        )}

                        {/* Delete */}
                        {!isAdm && (
                          <button
                            type="button"
                            className="action-icon-btn delete-btn"
                            onClick={() => handlePromptDelete(u)}
                            title="O'chirish"
                            style={{ padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', color: '#ef4444' }}
                          >
                            <IconTrash size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}
        >
          <div>
            Jami: <strong>{totalCount}</strong> ta foydalanuvchi &bull; Sahifa <strong>{page}</strong> / <strong>{totalPages}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="secondary-btn"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              &larr; Oldingi
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pNum = i + 1;
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: 'none',
                    cursor: 'pointer',
                    background: page === pNum ? 'var(--primary-accent)' : 'transparent',
                    color: page === pNum ? '#080d05' : 'var(--text-secondary)',
                    fontWeight: page === pNum ? 700 : 500
                  }}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              type="button"
              className="secondary-btn"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              Keyingi &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {formModalOpen && (
        <UserFormModal
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setUserToEdit(null);
          }}
          onSubmit={handleSaveUser}
          userToEdit={userToEdit}
          loading={formLoading}
        />
      )}

      {detailsModalOpen && (
        <UserDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setUserToView(null);
          }}
          user={userToView}
          onEdit={(u) => {
            setUserToEdit(u);
            setFormModalOpen(true);
          }}
          onToggleBlock={handlePromptToggleBlock}
          onDelete={handlePromptDelete}
        />
      )}

      {confirmModal.isOpen && (
        <ConfirmActionModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          isDanger={confirmModal.isDanger}
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          loading={confirmLoading}
        />
      )}
    </div>
  );
}
