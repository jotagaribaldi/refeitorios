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
  const [viewingBadge, setViewingBadge] = useState(false);

  if (!isAuthenticated) return <LoginPage />;

  // Tanto FISCAL quanto GERENTE têm acesso ao scanner de QR Code
  const isScanner = user?.role === 'FISCAL' || user?.role === 'GERENTE';

  if (scanning) {
    return (
      <div className="app-shell">
        <ScanFiscalPage onBack={() => { setScanning(false); setTab('home'); }} />
      </div>
    );
  }

  if (viewingBadge && isScanner) {
    return (
      <div className="app-shell">
        <div className="status-bar">
          <button
            onClick={() => setViewingBadge(false)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', font: 'inherit', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Voltar
          </button>
          <span className="status-title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            🏷️ Meu Crachá
          </span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <BadgePage />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-title">
          {tab === 'home'    ? (isScanner ? '📷 Scanner' : '🏷️ Meu Crachá') :
           tab === 'history' ? '📋 Histórico' : '👤 Perfil'}
        </span>
        <div className="status-right">
          <div className="avatar-sm" onClick={() => setTab('profile')}>
            {(user?.name?.charAt(0) || 'U').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'home' && (isScanner
          ? <HomePage onScan={() => setScanning(true)} onViewBadge={() => setViewingBadge(true)} />
          : <BadgePage />
        )}
        {tab === 'history' && <HistoryPage />}
        {tab === 'profile' && <ProfilePage />}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <button
          className={`tab-item ${tab === 'home' ? 'active' : ''}`}
          onClick={() => setTab('home')}
        >
          <span className="tab-icon">{isScanner ? '📷' : '🏷️'}</span>
          <span className="tab-label">{isScanner ? 'Início' : 'Crachá'}</span>
        </button>

        {/* Scan Button (elevated center) - Only for FISCAL e GERENTE */}
        {isScanner && (
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
        {!isScanner && <div style={{ flex: 1 }} />}

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
