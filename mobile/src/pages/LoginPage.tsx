import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-logo">
        <div className="login-logo-icon">🍽️</div>
        <h1 className="login-name">Refeitório</h1>
        <p className="login-tagline">Registre suas refeições com facilidade</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && (
          <div className="login-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">E-mail</label>
          <div className="input-icon-wrap">
            <span className="input-icon">✉️</span>
            <input
              className="input-field"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Senha</label>
          <div className="input-icon-wrap">
            <span className="input-icon">🔒</span>
            <input
              className="input-field"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="login-submit"
          disabled={loading || !email || !password}
        >
          {loading ? 'Entrando...' : '🚀 Entrar'}
        </button>
      </form>

      <p style={{
        position: 'absolute', bottom: 24, fontSize: 11,
        color: 'var(--text-dim)', textAlign: 'center'
      }}>
        Versão 1.0 • Refeitórios Corp
      </p>
    </div>
  );
}
