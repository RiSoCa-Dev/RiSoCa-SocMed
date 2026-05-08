import AppShell from './components/AppShell';
import LoginPage from './components/LoginPage';
import LegalPage from './pages/LegalPage';
import { AuthProvider, useAuth } from './lib/auth';

function AppContent() {
  const path = window.location.pathname;

  if (path === '/privacy') return <LegalPage type="privacy" />;
  if (path === '/terms') return <LegalPage type="terms" />;
  if (path === '/data-deletion') return <LegalPage type="data-deletion" />;

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="text-sm text-slate-400">Loading RiSoCa Scheduler...</p>
        </div>
      </main>
    );
  }

  return user ? <AppShell /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
