import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

type Tab = 'home' | 'history' | 'profile';

function AppShell() {
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [scanning, setScanning] = useState(false);

  if (!isAuthenticated) return <LoginPage />;

  if (scanning) {
    return (
      <div className="app-shell">
        <ScanPage onBack={() => { setScanning(false); setTab('home'); }} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-title">
          {tab === 'home'    ? '🏠 Início'    :
           tab === 'history' ? '📋 Histórico' : '👤 Perfil'}
        </span>
        <div className="status-right">
          <div className="avatar-sm" onClick={() => setTab('profile')}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'home'    && <HomePage onScan={() => setScanning(true)} />}
        {tab === 'history' && <HistoryPage />}
        {tab === 'profile' && <ProfilePage />}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <button
          className={`tab-item ${tab === 'home' ? 'active' : ''}`}
          onClick={() => setTab('home')}
        >
          <span className="tab-icon">🏠</span>
          <span className="tab-label">Início</span>
        </button>

        {/* Scan Button (elevated center) */}
        <div className="tab-scan">
          <button className="tab-scan-btn" onClick={() => setScanning(true)}>
            📷
          </button>
          <span className="tab-label" style={{ marginTop: 6, color: 'var(--text-dim)', fontSize: 10 }}>
            Scan
          </span>
        </div>

        <button
          className={`tab-item ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Histórico</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
