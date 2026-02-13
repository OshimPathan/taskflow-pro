import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error Boundary to prevent white page crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'Inter, sans-serif',
          background: '#F8F9FC', padding: '20px', textAlign: 'center'
        }}>
          <div style={{ maxWidth: '420px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '12px', color: '#0F172A' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{
                padding: '12px 24px', background: '#4F46E5', color: 'white',
                border: 'none', borderRadius: '12px', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
