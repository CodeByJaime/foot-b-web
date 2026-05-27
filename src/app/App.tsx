import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import Brackets from './pages/Brackets';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/standings/:tournamentId" element={<Standings />} />
          <Route path="/brackets/:tournamentId" element={<Brackets />} />
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