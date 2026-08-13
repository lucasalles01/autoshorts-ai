import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; info: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, info: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info: info.componentStack || '' });
    console.error('AutoShorts Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0B0F19',
          color: '#f1f5f9',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '1.5rem'
        }}>
          <div style={{
            background: '#131927',
            border: '1px solid #7c3aed',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '860px',
            width: '100%'
          }}>
            <h1 style={{ color: '#c084fc', fontSize: '1.4rem', marginBottom: '1rem' }}>
              ⚠️ AutoShorts AI — Erro de Inicialização
            </h1>
            <p style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {this.state.error?.toString()}
            </p>
            <pre style={{
              background: '#0B0F19',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#94a3b8',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              marginTop: '1rem'
            }}>
              {this.state.info}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🔄 Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
