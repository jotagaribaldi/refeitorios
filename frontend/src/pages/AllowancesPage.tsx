import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function AllowancesPage() {
  const { user: me } = useAuth();
  const isRoot = me?.role === 'ROOT';

  const [allowances, setAllowances] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [form, setForm] = useState({
    userId: '',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    totalAllowance: 30,
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/allowances?year=${year}&month=${month}`),
      api.get('/users'),
    ]).then(([a, u]) => {
      setAllowances(a.data);
      setUsers(u.data.filter((u: any) => u.role === 'FUNCIONARIO' && u.isActive));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year, month]);

  const openCreate = () => {
    setEditing(null);
    setError('');
    setForm({ userId: '', year, month, totalAllowance: 30 });
    setShowModal(true);
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setError('');
    setForm({ userId: a.userId, year: a.year, month: a.month, totalAllowance: a.totalAllowance });
    setShowModal(true);
  };

  const save = async () => {
    setError('');
    if (!form.userId) { setError('Selecione um funcionário.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/allowances/${editing.id}`, { totalAllowance: form.totalAllowance });
      } else {
        await api.post('/allowances', form);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar saldo');
    } finally {
      setSaving(false);
    }
  };

  const pct = (consumed: number, total: number) =>
    total > 0 ? Math.round((consumed / total) * 100) : 0;

  // Usuários que ainda não têm saldo no período filtrado
  const usersWithoutAllowance = users.filter(
    (u) => !allowances.some((a) => a.userId === u.id),
  );

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">💰 Saldos Mensais</h1>
          <p className="page-subtitle">
            {MONTHS[month - 1]} {year} — {allowances.length} funcionário(s) com saldo configurado
          </p>
        </div>
        <div className="flex gap-8" style={{ alignItems: 'center' }}>
          <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ width: 110 }}>
            {MONTHS_SHORT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} style={{ width: 100 }}>
            {[2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>+ Atribuir Saldo</button>
        </div>
      </div>

      {/* Aviso de funcionários sem saldo */}
      {!loading && usersWithoutAllowance.length > 0 && (
        <div className="alert alert-warning" style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠️</span>
          <span>
            <strong>{usersWithoutAllowance.length} funcionário(s)</strong> sem saldo em {MONTHS[month - 1]}/{year}:
            {' '}{usersWithoutAllowance.slice(0, 3).map((u) => u.name).join(', ')}
            {usersWithoutAllowance.length > 3 && ` e mais ${usersWithoutAllowance.length - 3}...`}
          </span>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : allowances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>Nenhum saldo configurado para {MONTHS_SHORT[month - 1]}/{year}</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>
              Atribuir primeiro saldo
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                {isRoot && <th>Empresa</th>}
                <th>Total</th>
                <th>Consumido</th>
                <th>Restante</th>
                <th style={{ minWidth: 160 }}>Progresso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {allowances.map((a) => {
                const remaining = a.totalAllowance - a.consumed;
                const p = pct(a.consumed, a.totalAllowance);
                return (
                  <tr key={a.id}>
                    <td className="fw-600">{a.user?.name || '-'}</td>
                    {isRoot && <td className="text-muted">{a.user?.tenant?.name || '-'}</td>}
                    <td>{a.totalAllowance}</td>
                    <td>{a.consumed}</td>
                    <td>
                      <span className={`badge ${remaining === 0 ? 'badge-red' : remaining < 5 ? 'badge-amber' : 'badge-green'}`}>
                        {remaining}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                          <div style={{
                            width: `${p}%`, height: '100%', borderRadius: 999,
                            background: p >= 90 ? 'var(--danger)' : p >= 70 ? 'var(--warning)' : 'var(--primary)',
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                        <span className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>{p}%</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(a)} title="Editar total">
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Editar Saldo' : 'Atribuir Saldo'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>
            )}

            {/* Funcionário — apenas na criação */}
            {!editing && (
              <div className="form-group">
                <label>Funcionário *</label>
                <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                  <option value="">Selecione o funcionário...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}{isRoot && u.tenant?.name ? ` — ${u.tenant.name}` : ''}
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="text-sm text-muted" style={{ marginTop: 6 }}>
                    Nenhum funcionário ativo encontrado.
                  </p>
                )}
              </div>
            )}

            {editing && (
              <div className="form-group">
                <label>Funcionário</label>
                <input value={editing.user?.name || '-'} disabled style={{ opacity: 0.6 }} />
              </div>
            )}

            {/* Período — apenas na criação */}
            {!editing && (
              <div className="grid-2">
                <div className="form-group">
                  <label>Mês</label>
                  <select value={form.month} onChange={(e) => setForm({ ...form, month: +e.target.value })}>
                    {MONTHS_SHORT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ano</label>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })}>
                    {[2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Total de refeições *</label>
              <input
                type="number"
                min={editing ? editing.consumed : 1}
                max={500}
                value={form.totalAllowance}
                onChange={(e) => setForm({ ...form, totalAllowance: +e.target.value })}
              />
              {editing && (
                <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                  Já consumidas: {editing.consumed} — o total não pode ser menor que o consumido.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || (!editing && !form.userId)}>
                {saving ? 'Salvando...' : '💾 Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
