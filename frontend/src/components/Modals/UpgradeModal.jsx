import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { audioManager } from '../../utils/audio';
import { fireCelebrationConfetti } from '../../utils/confetti';

export function UpgradeModal({ isOpen, onClose }) {
  const { currentUser, upgradeToPremium } = useAuth();
  const { addToast } = useHabits();
  const { t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'payme', 'click'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate quick secure transaction processing
      await new Promise(r => setTimeout(r, 900));

      const success = await upgradeToPremium();
      if (success) {
        audioManager.playCelebration();
        fireCelebrationConfetti();
        addToast(
          "Tabriklaymiz! ⚡ PRO Faollashtirildi!",
          "Barcha premium mavzular va imkoniyatlar ochildi ($10 to'lov muvaffaqiyatli)",
          "success",
          6000
        );
        onClose();
      } else {
        addToast("Xatolik", "To'lovni tasdiqlashda xatolik yuz berdi", "warning");
      }
    } catch (err) {
      addToast("Xatolik", err.message || "To'lov amalga oshmadi", "warning");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card small-modal upgrade-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff' }}>
              ⚡
            </div>
            <div>
              <h3 className="modal-title">Intizomly PRO</h3>
              <p className="modal-desc">Cheksiz imkoniyatlar va premium intizom</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">&times;</button>
        </div>

        <form onSubmit={handlePayment} className="modal-body">
          {/* Price Box */}
          <div className="upgrade-price-box">
            <div className="upgrade-price-header">
              <span className="price-tag">$10</span>
              <span className="price-duration">/ bir martalik to'lov (umrbod)</span>
            </div>
            <p className="price-subtext">Bir marta to'laysiz, barcha kelgusi yangilanishlar bilan birga doimiy ishlatasiz.</p>
          </div>

          {/* Perks list */}
          <div className="upgrade-perks-list">
            <div className="perk-item">
              <span className="perk-icon">🎨</span>
              <div className="perk-info">
                <strong>Eksklyuziv suyuq rangli mavzular</strong>
                <span>Violet Liquid, Cyber Neon, Royal Gold va OLED Pitch Black ranglari</span>
              </div>
            </div>

            <div className="perk-item">
              <span className="perk-icon">📊</span>
              <div className="perk-info">
                <strong>Kengaytirilgan chuqur tahlil</strong>
                <span>365 kunlik intizom grafigi va to'liq statistika</span>
              </div>
            </div>

            <div className="perk-item">
              <span className="perk-icon">⚡</span>
              <div className="perk-info">
                <strong>PRO VIP Maqomi</strong>
                <span>Shaxsiy profilda maxsus oltin nishon va ustuvor sinxronizatsiya</span>
              </div>
            </div>

            <div className="perk-item">
              <span className="perk-icon">🎯</span>
              <div className="perk-info">
                <strong>Cheksiz odatlar va eslatmalar</strong>
                <span>Hech qanday cheklovlarsiz shaxsiy intizom nazorati</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="form-group" style={{ marginTop: '14px' }}>
            <label>To'lov usulini tanlang</label>
            <div className="ios-segmented-control" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <button
                type="button"
                className={`segmented-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Karta
              </button>
              <button
                type="button"
                className={`segmented-btn ${paymentMethod === 'payme' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('payme')}
              >
                🟢 Payme
              </button>
              <button
                type="button"
                className={`segmented-btn ${paymentMethod === 'click' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('click')}
              >
                🔵 Click
              </button>
            </div>
          </div>

          {/* Mock Card inputs */}
          {paymentMethod === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Karta raqami: 8600 •••• •••• •••• yoki 4000 ••••"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                required
              />
              <div className="form-row-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Muddati (MM/YY)"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength={5}
                  required
                />
                <input
                  type="password"
                  className="form-control"
                  placeholder="CVC/CVV"
                  maxLength={4}
                />
              </div>
            </div>
          )}

          {paymentMethod !== 'card' && (
            <div style={{
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginTop: '6px'
            }}>
              {paymentMethod === 'payme' ? '🟢 Payme ilovasi orqali $10 (ekvivalent so\'mda) to\'lov qilinadi.' : '🔵 Click orqali $10 (ekvivalent so\'mda) to\'lov qilinadi.'}
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '16px' }}>
            <button type="button" className="btn-subtle" onClick={onClose} disabled={isProcessing}>
              Bekor qilish
            </button>
            <button type="submit" className="primary-btn" disabled={isProcessing} style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              border: 'none',
              fontWeight: 700
            }}>
              {isProcessing ? "To'lov tekshirilmoqda..." : "To'lovni Tasdiqlash ($10)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
