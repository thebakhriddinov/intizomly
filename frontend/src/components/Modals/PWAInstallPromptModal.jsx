import React, { useState } from 'react';
import { usePWA } from '../../context/PWAContext';
import { useHabits } from '../../context/HabitsContext';
import { BrandLogo } from '../Common/BrandLogo';
import { IconLightning, IconAlarm, IconCheck, IconApple, IconAndroid } from '../Common/AppIcons';

export function PWAInstallPromptModal({ isOpen, onClose }) {
  const { isStandalone, isIOS, isAndroid, canInstallPrompt, triggerInstall } = usePWA();
  const { addToast } = useHabits();
  const [step, setStep] = useState('prompt'); // 'prompt' | 'ios-guide' | 'android-guide'
  const [loading, setLoading] = useState(false);

  if (!isOpen || isStandalone) return null;

  const handleInstallClick = async () => {
    setLoading(true);
    try {
      const res = await triggerInstall();
      if (res.status === 'accepted') {
        if (addToast) {
          addToast("Muvaffaqiyatli! 🎉", "Intizomly ilovasi telefoningizga o'rnatildi!", "success");
        }
        onClose?.();
      } else if (res.status === 'ios-guide') {
        setStep('ios-guide');
      } else if (res.status === 'manual-guide') {
        setStep(isIOS ? 'ios-guide' : 'android-guide');
      } else if (res.status === 'already-installed') {
        if (addToast) addToast("Ma'lumot", "Ilova allaqachon o'rnatilgan!", "info");
        onClose?.();
      } else {
        // Dismissed or unsupported
        if (isIOS) {
          setStep('ios-guide');
        } else {
          setStep('android-guide');
        }
      }
    } catch (err) {
      console.warn('[PWA] install error:', err);
      if (isIOS) setStep('ios-guide');
      else setStep('android-guide');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('intizomly_pwa_install_dismissed_at', String(Date.now()));
    } catch {}
    onClose?.();
  };

  return (
    <div className="modal-overlay pwa-install-overlay" onClick={handleDismiss}>
      <div className="modal-card pwa-install-prompt-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={handleDismiss}
          aria-label="Yopish"
        >
          &times;
        </button>

        {step === 'prompt' ? (
          <>
            {/* Visual Icon / Logo */}
            <div className="pwa-prompt-visual">
              <div className="pwa-app-icon-squircle">
                <img
                  src="/icons/icon-192.png"
                  alt="Intizomly"
                  className="pwa-squircle-img"
                  draggable={false}
                />
              </div>
              <span className="pwa-prompt-tag">
                <span className="pulse-dot"></span>
                <span>Mobil Ilova (PWA)</span>
              </span>
            </div>

            {/* Title & Description */}
            <div className="pwa-prompt-content">
              <h3 className="pwa-prompt-title">Ilova o'rnatilsinmi?</h3>
              <p className="pwa-prompt-desc">
                Intizomly ilovasini telefoningiz bosh ekraniga o'rnatib oling. Brauzersiz, 1 soniyada xuddi rasmiy ilovadek ochiladi!
              </p>
            </div>

            {/* Benefits Pills */}
            <div className="pwa-benefits-list">
              <div className="pwa-benefit-item">
                <div className="pwa-benefit-icon">
                  <IconLightning size={16} color="#10B981" />
                </div>
                <div className="pwa-benefit-text">
                  <strong>Tezkor kirish</strong>
                  <span>Brauzersiz, to'g'ridan-to'g'ri bosh ekrandan ochiladi</span>
                </div>
              </div>

              <div className="pwa-benefit-item">
                <div className="pwa-benefit-icon">
                  <IconAlarm size={16} color="#06B6D4" />
                </div>
                <div className="pwa-benefit-text">
                  <strong>Kunlik eslatmalar</strong>
                  <span>Odatlaringiz vaqti kelganda eslatmalar keladi</span>
                </div>
              </div>

              <div className="pwa-benefit-item">
                <div className="pwa-benefit-icon">
                  <IconCheck size={16} color="#B6F36B" />
                </div>
                <div className="pwa-benefit-text">
                  <strong>0 MB xotira</strong>
                  <span>Telefon xotirasini deyarli band qilmaydi</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pwa-prompt-actions">
              <button
                type="button"
                className="btn-pwa-install-confirm"
                onClick={handleInstallClick}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{loading ? "Yuklanmoqda..." : "Ha, o'rnatish"}</span>
              </button>

              <button
                type="button"
                className="btn-pwa-install-dismiss"
                onClick={handleDismiss}
              >
                Keyinroq
              </button>
            </div>
          </>
        ) : step === 'ios-guide' ? (
          /* iOS Step-by-Step Interactive Guide */
          <div className="pwa-ios-guide-box">
            <div className="pwa-guide-top">
              <div className="pwa-guide-device-badge">
                <IconApple size={16} />
                <span>iPhone (iOS / Safari)</span>
              </div>
              <h4 className="pwa-guide-title">Bosh ekranga qo'shish</h4>
              <p className="pwa-guide-subtitle">
                Safari brauzerida 3 ta oddiy qadam bilan o'rnating:
              </p>
            </div>

            <div className="pwa-ios-steps">
              <div className="ios-step-card">
                <div className="ios-step-num">1</div>
                <div className="ios-step-body">
                  <div className="ios-step-heading">
                    Pastdagi <strong>«Ulashish» (Share)</strong> tugmasini bosing
                  </div>
                  <div className="ios-step-hint">
                    Safari ekranining eng pastki qatoridagi kvadrat ichidagi yuqoriga qaragan o'qchani bosing:
                    <span className="ios-key-pill">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#007AFF" strokeWidth="2.5">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      Share (Поделиться)
                    </span>
                  </div>
                </div>
              </div>

              <div className="ios-step-card">
                <div className="ios-step-num">2</div>
                <div className="ios-step-body">
                  <div className="ios-step-heading">
                    <strong>«Bosh ekranga qo'shish»</strong> bandini tanlang
                  </div>
                  <div className="ios-step-hint">
                    Menyuni biroz pastga surib, quyidagi qatorni bosing:
                    <span className="ios-key-pill">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      Add to Home Screen (+)
                    </span>
                  </div>
                </div>
              </div>

              <div className="ios-step-card">
                <div className="ios-step-num">3</div>
                <div className="ios-step-body">
                  <div className="ios-step-heading">
                    Yuqori o'ngdagi <strong>«Qo'shish» (Add)</strong> ni bosing
                  </div>
                  <div className="ios-step-hint">
                    Telefoningiz bosh ekranida <strong>Intizomly</strong> logosi paydo bo'ladi!
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-pwa-install-confirm"
              onClick={handleDismiss}
              style={{ width: '100%', marginTop: '16px' }}
            >
              <span>Tushundim, rahmat!</span>
            </button>
          </div>
        ) : (
          /* Android Guide */
          <div className="pwa-ios-guide-box">
            <div className="pwa-guide-top">
              <div className="pwa-guide-device-badge">
                <IconAndroid size={16} />
                <span>Android (Chrome)</span>
              </div>
              <h4 className="pwa-guide-title">Telefoningizga o'rnatish</h4>
              <p className="pwa-guide-subtitle">
                Chrome brauzerida 2 ta oddiy qadam:
              </p>
            </div>

            <div className="pwa-ios-steps">
              <div className="ios-step-card">
                <div className="ios-step-num">1</div>
                <div className="ios-step-body">
                  <div className="ios-step-heading">
                    Brauzer menyusini oching <strong>(3 ta nuqta ⋮)</strong>
                  </div>
                  <div className="ios-step-hint">
                    Chrome brauzerining yuqori o'ng burchagidagi uchta nuqtani bosing.
                  </div>
                </div>
              </div>

              <div className="ios-step-card">
                <div className="ios-step-num">2</div>
                <div className="ios-step-body">
                  <div className="ios-step-heading">
                    <strong>«Ilovani o'rnatish»</strong> bandini tanlang
                  </div>
                  <div className="ios-step-hint">
                    Menyudan <em>«Install app»</em> yoki <em>«Добавить на главный экран»</em> ni bosing va tasdiqlang!
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-pwa-install-confirm"
              onClick={handleDismiss}
              style={{ width: '100%', marginTop: '16px' }}
            >
              <span>Tushundim, rahmat!</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

