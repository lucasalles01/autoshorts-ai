import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PlansPage } from './pages/PlansPage';
import { LandingPage } from './pages/LandingPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Lazy load pages to isolate any runtime errors
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const NewProjectWizard = lazy(() => import('./pages/NewProjectWizard').then(m => ({ default: m.NewProjectWizard })));
const MyProjects = lazy(() => import('./pages/MyProjects').then(m => ({ default: m.MyProjects })));
const ClipReviewEditor = lazy(() => import('./pages/ClipReviewEditor').then(m => ({ default: m.ClipReviewEditor })));
const PublishingQueue = lazy(() => import('./pages/PublishingQueue').then(m => ({ default: m.PublishingQueue })));
const ContentCalendar = lazy(() => import('./pages/ContentCalendar').then(m => ({ default: m.ContentCalendar })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(m => ({ default: m.LibraryPage })));
const SocialAccountsPage = lazy(() => import('./pages/SocialAccountsPage').then(m => ({ default: m.SocialAccountsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback').then(m => ({ default: m.OAuthCallback })));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Carregando AutoShorts AI...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ConnectionError = ({ onRetry }: { onRetry: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
    <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#dc2626/20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AlertCircle style={{ width: 32, height: 32, color: '#dc2626' }} />
    </div>
    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e5e7eb', marginBottom: '0.5rem' }}>
        Não foi possível conectar ao servidor
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        O servidor do AutoShorts AI não respondeu. Isso pode ser um problema temporário ou de conexão.
      </p>
      <button
        onClick={onRetry}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'backgroundColor 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6d28d0'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
      >
        <RefreshCw style={{ width: 16, height: 16 }} />
        Tentar novamente
      </button>
    </div>
  </div>
);

export const App: React.FC = () => {
  const { activeTab, refreshAll, isLoading, error } = useAppStore();
  const { user, loading: authLoading, initialize } = useAuthStore();
  const [connectionError, setConnectionError] = useState(false);
  const [initTimeout, setInitTimeout] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Set timeout for auth initialization
      timeoutId = setTimeout(() => {
        console.warn('Auth initialization timeout');
        setInitTimeout(true);
      }, 5000);

      initialize().finally(() => {
        clearTimeout(timeoutId);
      });
    } catch (err) {
      console.error('Auth initialization failed:', err);
      clearTimeout(timeoutId);
      // Continue without auth if initialization fails
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [initialize]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Set timeout for data refresh
      timeoutId = setTimeout(() => {
        console.warn('Data refresh timeout');
        setConnectionError(true);
      }, 5000);

      refreshAll().finally(() => {
        clearTimeout(timeoutId);
      });
    } catch (err) {
      console.error('Data refresh failed:', err);
      clearTimeout(timeoutId);
      setConnectionError(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [refreshAll]);

  const handleRetry = () => {
    setConnectionError(false);
    setInitTimeout(false);
    refreshAll();
  };

  if (authLoading && !initTimeout) {
    return <PageLoader />;
  }

  if (connectionError || initTimeout) {
    return <ConnectionError onRetry={handleRetry} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'new_project':
        return <NewProjectWizard />;
      case 'my_projects':
        return <MyProjects />;
      case 'clip_editor':
        return <ClipReviewEditor />;
      case 'queue':
        return <PublishingQueue />;
      case 'calendar':
        return <ContentCalendar />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'library':
        return <LibraryPage />;
      case 'social_accounts':
        return <SocialAccountsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'plans':
        return <PlansPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-cyber-dark text-gray-100 font-sans antialiased">
              {/* Sidebar Navigation */}
              <Navigation />

              {/* Main Content Workspace Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                {error && (
                  <div className="mx-8 mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs">
                    Backend offline ou erro de conexão: {error}. Verifique se o backend está rodando na porta 3001.
                  </div>
                )}
                <main className="flex-1 p-8 overflow-y-auto">
                  {connectionError ? (
                    <ConnectionError onRetry={handleRetry} />
                  ) : isLoading && activeTab === 'dashboard' ? (
                    <PageLoader />
                  ) : (
                    <Suspense fallback={<PageLoader />}>
                      {renderActivePage()}
                    </Suspense>
                  )}
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};
