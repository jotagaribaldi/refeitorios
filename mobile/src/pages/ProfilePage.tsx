import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [allowance, setAllowance] = useState<any>(null);
  const now = new Date();
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  useEffect(() => {
    api.get(`/allowances?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
      .then((r) => {
        const mine = r.data.find((a: any) => a.userId === user?.id || a.user?.id === user?.id);
        setAllowance(mine || null);
      })
      .catch(console.error);
  }, []);

  const remaining = allowance ? allowance.totalAllowance - allowance.consumed : null;

  const menuItems = [
    {
      icon: '💰', color: 'rgba(0,208,132,0.15)', label: 'Saldo do mês',
      sub: allowance
        ? `${remaining} restantes de ${allowance.totalAllowance} — ${months[now.getMonth()]}/${now.getFullYear()}`
        : 'Não configurado',
    },
    {
      icon: '📅', color: 'rgba(88,166,255,0.15)', label: 'Mês atual',
      sub: `${months[now.getMonth()]} de ${now.getFullYear()}`,
    },
    {
      icon: '🏢', color: 'rgba(124,92,252,0.15)', label: 'Empresa',
      sub: user?.tenant?.name || 'N/A',
    },
  ];

  return (
    <div className="scroll-view">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-name">{user?.name}</div>
        <div className="profile-email">{user?.email}</div>
        <div className="profile-badge">{user?.role}</div>
      </div>

      {/* Menu items */}
      <div className="menu-list">
        <div className="section-title" style={{ padding: '16px 0 8px' }}>Informações</div>

        {menuItems.map((item, i) => (
          <div key={i} className="menu-item">
            <div className="menu-item-icon" style={{ background: item.color }}>
              {item.icon}
            </div>
            <div className="menu-item-text">
              <div className="menu-item-label">{item.label}</div>
              <div className="menu-item-sub">{item.sub}</div>
            </div>
          </div>
        ))}

        <div className="menu-separator" style={{ margin: '12px 0' }} />

        {/* Saldo visual */}
        {allowance && (
          <>
            <div className="section-title" style={{ padding: '0 0 10px' }}>Uso do saldo</div>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                <span>Consumido: <strong style={{ color: 'var(--text)' }}>{allowance.consumed}</strong></span>
                <span>Total: <strong style={{ color: 'var(--text)' }}>{allowance.totalAllowance}</strong></span>
              </div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 'var(--r-full)', height: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((allowance.consumed / allowance.totalAllowance) * 100, 100)}%`,
                  height: '100%', borderRadius: 'var(--r-full)',
                  background: remaining === 0 ? 'var(--danger)' : (remaining ?? 0) < 5 ? 'var(--warning)' : 'var(--primary)',
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                {remaining === 0
                  ? '⚠️ Saldo esgotado'
                  : `${remaining} refeições restantes`}
              </div>
            </div>
            <div className="menu-separator" style={{ margin: '16px 0' }} />
          </>
        )}

        {/* Logout */}
        <div
          className="menu-item"
          onClick={logout}
          style={{ marginTop: 4 }}
        >
          <div className="menu-item-icon" style={{ background: 'rgba(248,81,73,0.15)' }}>
            🚪
          </div>
          <div className="menu-item-text">
            <div className="menu-item-label" style={{ color: 'var(--danger)' }}>Sair</div>
            <div className="menu-item-sub">Encerrar sessão</div>
          </div>
          <div className="menu-item-arrow">›</div>
        </div>

        <div style={{ height: 32 }} />
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 16, fontSize: 11, color: 'var(--text-dim)' }}>
        Refeitório App v1.0
      </div>
    </div>
  );
}
