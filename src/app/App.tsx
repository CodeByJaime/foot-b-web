import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Standings from './pages/Standings';
import Brackets from './pages/Brackets';
import MatchesPage from './pages/Matches';
import AuthPage from './pages/AuthPage';
import type { ReactNode } from 'react';

// ─── Loading screen ───────────────────────────────────────────────────────────

function AuthLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      fontFamily: "'Barlow Condensed', system-ui, sans-serif",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '3px solid rgba(34,197,94,0.15)',
        borderTopColor: '#22c55e',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' }}>
        Verificando sesión...
      </span>
    </div>
  );
}

// ─── Route guards ─────────────────────────────────────────────────────────────

/** Solo accesible con sesión activa — si no, redirige a /auth */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user)   return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

/** Solo accesible sin sesión — si ya hay sesión, redirige a /dashboard */
function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>

              {/* ── Rutas públicas (solo sin sesión) ── */}
              <Route path="/" element={
                <PublicOnlyRoute><LandingPage /></PublicOnlyRoute>
              } />
              <Route path="/auth" element={
                <PublicOnlyRoute><AuthPage /></PublicOnlyRoute>
              } />

              {/* ── Rutas protegidas (requieren sesión) ── */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/tournaments" element={
                <ProtectedRoute><Tournaments /></ProtectedRoute>
              } />
              <Route path="/tournaments/:id" element={
                <ProtectedRoute><TournamentDetail /></ProtectedRoute>
              } />
              <Route path="/teams" element={
                <ProtectedRoute><Teams /></ProtectedRoute>
              } />
              <Route path="/teams/:id" element={
                <ProtectedRoute><TeamDetail /></ProtectedRoute>
              } />
              <Route path="/standings/:tournamentId" element={
                <ProtectedRoute><Standings /></ProtectedRoute>
              } />
              <Route path="/brackets" element={
                <ProtectedRoute><Brackets /></ProtectedRoute>
              } />
              <Route path="/brackets/:tournamentId" element={
                <ProtectedRoute><Brackets /></ProtectedRoute>
              } />
              <Route path="/matches" element={
                <ProtectedRoute><MatchesPage /></ProtectedRoute>
              } />
              <Route path="/matches/:tournamentId" element={
                <ProtectedRoute><MatchesPage /></ProtectedRoute>
              } />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
