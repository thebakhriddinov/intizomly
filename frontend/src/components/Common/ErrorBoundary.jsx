import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Intizomly ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px 24px',
          margin: '20px auto',
          maxWidth: '540px',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '20px',
          color: '#F8FAFC'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            fontSize: '24px'
          }}>
            ⚠️
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>
            Sahifani yuklashda xatolik yuz berdi
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            Kutilmagan xatolik yuz berdi. Iltimos, sahifani qayta yuklang yoki Bosh sahifaga qayting.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                background: '#10B981',
                color: '#080D05',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Qayta urinish
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/?tab=home';
              }}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#F8FAFC',
                fontWeight: 600,
                fontSize: '13px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer'
              }}
            >
              Bosh sahifa
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

