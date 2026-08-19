import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';

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

export const App: React.FC = () => {
  const { activeTab, refreshAll, isLoading, error } = useAppStore();
  const { user, loading: authLoading, initialize } = useAuthStore();

  useEffect(() => {
    try {
      initialize();
    } catch (err) {
      console.error('Auth initialization failed:', err);
      // Continue without auth if initialization fails
    }
  }, [initialize]);

  useEffect(() => {
    try {
      refreshAll();
    } catch (err) {
      console.error('Data refresh failed:', err);
      // Continue without data if refresh fails
    }
  }, [refreshAll]);

  if (authLoading) {
    return <PageLoader />;
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
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
                  {isLoading && activeTab === 'dashboard' ? (
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
