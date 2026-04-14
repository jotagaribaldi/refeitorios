import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import BadgePage from './pages/BadgePage';
import HomePage from './pages/HomePage';
import ScanFiscalPage from './pages/ScanFiscalPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

type Tab = 'home' | 'history' | 'profile';

function AppShell() {
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [scanning, setScanning] = useState(false);

  if (!isAuthenticated) return <LoginPage />;

  const isFiscal = user?.role === 'FISCAL';

  if (scanning) {
    return (
      <div className="app-shell">
        <ScanFiscalPage onBack={() => { setScanning(false); setTab('home'); }} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-title">
          {tab === 'home'    ? (isFiscal ? '📷 Fiscal' : '🏷️ Meu Crachá') :
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
        {tab === 'home' && (isFiscal ? <HomePage onScan={() => setScanning(true)} /> : <BadgePage />)}
        {tab === 'history' && <HistoryPage />}
        {tab === 'profile' && <ProfilePage />}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <button
          className={`tab-item ${tab === 'home' ? 'active' : ''}`}
          onClick={() => setTab('home')}
        >
          <span className="tab-icon">{isFiscal ? '📷' : '🏷️'}</span>
          <span className="tab-label">{isFiscal ? 'Início' : 'Crachá'}</span>
        </button>

        {/* Scan Button (elevated center) - Only for FISCAL */}
        {isFiscal && (
          <div className="tab-scan">
            <button className="tab-scan-btn" onClick={() => setScanning(true)}>
              📷
            </button>
            <span className="tab-label" style={{ marginTop: 6, color: 'var(--text-dim)', fontSize: 10 }}>
              Scan
            </span>
          </div>
        )}

        {/* Placeholder for FUNCIONARIO */}
        {!isFiscal && <div style={{ flex: 1 }} />}

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
