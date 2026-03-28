import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['ROOT', 'GERENTE'] },
  { to: '/tenants', icon: '🏢', label: 'Empresas', roles: ['ROOT'] },
  { to: '/restaurants', icon: '🍽️', label: 'Refeitórios', roles: ['ROOT', 'GERENTE'] },
  { to: '/users', icon: '👥', label: 'Funcionários', roles: ['ROOT', 'GERENTE'] },
  { to: '/allowances', icon: '💰', label: 'Saldos', roles: ['ROOT', 'GERENTE'] },
  { to: '/consumptions', icon: '📋', label: 'Consumos', roles: ['ROOT', 'GERENTE'] },
  { to: '/meal-types', icon: '⏰', label: 'Tipos de Refeição', roles: ['ROOT', 'GERENTE'] },
  { to: '/scan', icon: '📲', label: 'Escanear QR', roles: ['FUNCIONARIO'] },
  { to: '/my-consumptions', icon: '📋', label: 'Meus Consumos', roles: ['FUNCIONARIO'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = navItems.filter((n) => n.roles.includes(user?.role ?? ''));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🍽️</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Refeitórios</span>
          <span className="sidebar-logo-sub">
            {user?.tenant?.name || user?.role}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu</span>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sair">🚪</button>
        </div>
      </div>
    </aside>
  );
}
