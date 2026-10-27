import React, { useState } from 'react';
import { usePWA } from '../../context/PWAContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';

export function PWAInstallCard({ compact = false }) {
  const { isStandalone, isInstalled, canInstallPrompt, isIOS, triggerInstall } = usePWA();
  const { triggerBanner, addToast } = useHabits();
  const { t } = useLanguage();

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTab, setGuideTab] = useState(isIOS ? 'ios' : 'android');
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const result = await triggerInstall();
      if (result.status === 'accepted') {
        if (addToast) {
          addToast("Muvaffaqiyatli! 🎉", "Intizomly ilovasi telefoningizga o'rnatildi!", "success");
        } else if (triggerBanner) {
          triggerBanner("🎉 Ilova o'rnatildi!", "Intizomly telefoningiz bosh ekraniga joylashtirildi.");
        }
      } else if (result.status === 'already-installed') {
        if (addToast) addToast("Ma'lumot", "Ilova allaqachon o'rnatilgan!", "info");
      } else if (result.status === 'ios-guide' || result.status === 'manual-guide') {
        setShowGuideModal(true);
      }
    } catch (err) {
      console.error(err);
      setShowGuideModal(true);
    } finally {
      setInstalling(false);
    }
  };

  // If running inside standalone app already
  if (isStandalone) {
    return (
      <div className={`pwa-card pwa-card-standalone ${compact ? 'compact' : ''}`}>
        <div className="pwa-card-header">
          <div className="pwa-icon-box installed">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pwa-card-title-group">
            <div className="pwa-badge-row">
              <h4 className="pwa-card-title">Intizomly Mobil Ilovasi</h4>
              <span className="pwa-status-badge active">
                <span className="pulse-dot"></span> Faol Ilova (PWA)
              </span>
            </div>
            <p className="pwa-card-desc">
              Siz Intizomly-dan mustaqil mobil ilova sifatida foydalanmoqdasiz. Barcha bildirishnomalar va oflayn xususiyatlar yoqilgan!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`pwa-card ${compact ? 'compact' : ''}`}>
        <div className="pwa-card-header">
          <div className="pwa-icon-box">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pwa-card-title-group">
            <div className="pwa-badge-row">
              <h4 className="pwa-card-title">Ilovani Telefonga Yuklab Olish</h4>
              <span className="pwa-status-badge recommend">
                Tavsiya etiladi
              </span>
            </div>
            <p className="pwa-card-desc">
              Ilovani telefoningiz bosh ekraniga o'rnatib oling. Brauzersiz, 1 soniyada xuddi App Store/Play Store ilovasidek ochiladi!
            </p>
          </div>
        </div>

        {!compact && (
          <div className="pwa-features-grid">
            <div className="pwa-feature-item">
              <div className="pwa-feat-icon">⚡</div>
              <div className="pwa-feat-text">
                <strong>0MB Xotira</strong>
                <span>Telefon xotirasini band qilmaydi</span>
              </div>
            </div>
            <div className="pwa-feature-item">
              <div className="pwa-feat-icon">🚀</div>
              <div className="pwa-feat-text">
                <strong>Bir zumda kirish</strong>
                <span>Bosh ekrandagi belgidan to'g'ridan-to'g'ri</span>
              </div>
            </div>
            <div className="pwa-feature-item">
              <div className="pwa-feat-icon">🔔</div>
              <div className="pwa-feat-text">
                <strong>Avtonom Eslatmalar</strong>
                <span>Odatlar va intizom streak signallari</span>
              </div>
            </div>
          </div>
        )}

        <div className="pwa-card-actions">
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstallClick}
            disabled={installing}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{isIOS ? "🍏 iPhone ga O'rnatish" : "📲 Telefonga O'rnatish"}</span>
          </button>

          <button
            type="button"
            className="pwa-guide-btn"
            onClick={() => setShowGuideModal(true)}
            title="Qo'llanmani ko'rish"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
            </svg>
            <span>Qo'llanma</span>
          </button>
        </div>
      </div>

      {/* STEP-BY-STEP PWA INSTALLATION MODAL */}
      {showGuideModal && (
        <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="modal-card pwa-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="pwa-guide-header-icon">📲</div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: '17px' }}>Telefonga O'rnatish Qo'llanmasi</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>1 daqiqada ilova sifatida sozlash</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowGuideModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px 20px 24px 20px' }}>
              {/* Platform Switcher Tabs */}
              <div className="ios-segmented-control" style={{ marginBottom: '18px' }}>
                <button
                  type="button"
                  className={`segmented-btn ${guideTab === 'ios' ? 'active' : ''}`}
                  onClick={() => setGuideTab('ios')}
                >
                  🍏 iPhone (iOS / Safari)
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${guideTab === 'android' ? 'active' : ''}`}
                  onClick={() => setGuideTab('android')}
                >
                  🤖 Android (Chrome)
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${guideTab === 'desktop' ? 'active' : ''}`}
                  onClick={() => setGuideTab('desktop')}
                >
                  💻 Kompyuter (PC / Mac)
                </button>
              </div>

              {/* iOS GUIDE */}
              {guideTab === 'ios' && (
                <div className="pwa-steps-list">
                  <div className="pwa-step-item">
                    <div className="pwa-step-num">1</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        Safari-da <strong>"Ulashish" (Share)</strong> tugmasini bosing
                      </div>
                      <div className="pwa-step-desc">
                        Safari ekranining eng pastki qatoridagi o'rtadagi kvadrat ichidagi yuqoriga qaragan o'q belgisini bosing:
                        <span className="pwa-key-inline">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                          Share (Поделиться)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pwa-step-item">
                    <div className="pwa-step-num">2</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        <strong>"Bosh ekranga qo'shish"</strong> ni tanlang
                      </div>
                      <div className="pwa-step-desc">
                        Ochilgan menyuni biroz pastga aylantirib, <strong>"Add to Home Screen"</strong> (yoki ruscha <em>"На экран «Домой»"</em>) bandini bosing:
                        <span className="pwa-key-inline">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                          Bosh ekranga qo'shish (+)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pwa-step-item">
                    <div className="pwa-step-num">3</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        Yuqori o'ngdagi <strong>"Qo'shish" (Add)</strong> ni bosing
                      </div>
                      <div className="pwa-step-desc">
                        Burchakdagi ko'k "Add" tugmasini bosganingizdan so'ng, telefoningiz ish stolida <strong>Intizomly</strong> logosi paydo bo'ladi!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ANDROID GUIDE */}
              {guideTab === 'android' && (
                <div className="pwa-steps-list">
                  <div className="pwa-step-item">
                    <div className="pwa-step-num">1</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        Brauzer menyusini oching <strong>(3 ta nuqta ⋮)</strong>
                      </div>
                      <div className="pwa-step-desc">
                        Chrome yoki Samsung Internet brauzerining yuqori o'ng burchagidagi uch nuqtani bosing.
                      </div>
                    </div>
                  </div>

                  <div className="pwa-step-item">
                    <div className="pwa-step-num">2</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        <strong>"Ilovani o'rnatish"</strong> tugmasini bosing
                      </div>
                      <div className="pwa-step-desc">
                        Menyu ichidan <em>"Ilovani o'rnatish"</em> (Install app) yoki <em>"Bosh ekranga qo'shish"</em> (Add to Home screen) qatorini tanlang.
                      </div>
                    </div>
                  </div>

                  <div className="pwa-step-item">
                    <div className="pwa-step-num">3</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        Tasdiqlang va foydalaning!
                      </div>
                      <div className="pwa-step-desc">
                        Telefoningiz ilovalar ro'yxatida va bosh ekranida Intizomly rasmiy ilova sifatida saqlanadi.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DESKTOP GUIDE */}
              {guideTab === 'desktop' && (
                <div className="pwa-steps-list">
                  <div className="pwa-step-item">
                    <div className="pwa-step-num">1</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        Qidiruv manzil qatoriga qarang
                      </div>
                      <div className="pwa-step-desc">
                        Google Chrome yoki Microsoft Edge manzil qatori (URL bar) o'ng tomonida kichik <strong>O'rnatish (📥)</strong> belgisi joylashgan.
                      </div>
                    </div>
                  </div>

                  <div className="pwa-step-item">
                    <div className="pwa-step-num">2</div>
                    <div className="pwa-step-content">
                      <div className="pwa-step-title">
                        "O'rnatish" tugmasini bosing
                      </div>
                      <div className="pwa-step-desc">
                        Ilova alohida dastur oynasida ochiladi va Windows/Mac dasturlar menyusiga qo'shiladi.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pwa-guide-tip-box">
                <div style={{ fontSize: '18px' }}>💡</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  O'rnatib bo'lingach, dastur brauzer yorliqlari va qidiruv qatorisiz, xuddi do'kondan yuklab olingan rasmiy ilovadek toza interfeysda ochiladi.
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setShowGuideModal(false)}
                >
                  Tushundim, rahmat!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
