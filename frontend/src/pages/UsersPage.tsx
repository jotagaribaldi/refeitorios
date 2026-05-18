import { useEffect, useState } from 'react';
import { encodeCode128B } from '../utils/barcode';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ROLES = ['GERENTE', 'FISCAL', 'FUNCIONARIO'];

// Renderiza código de barras Code 128 B como SVG puro (sem dependências externas)
function BarcodeDisplay({ value, userName, employeeCode }: { value: string; userName: string; employeeCode?: string }) {
  let bars: { x: number; width: number }[] = [];
  let totalWidth = 200;
  try {
    const encoded = encodeCode128B(value);
    bars = encoded.bars;
    totalWidth = encoded.totalWidth;
  } catch (e) {
    console.error('Erro ao codificar barcode:', e);
  }

  const scale = 1.5;
  const height = 80;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg
        width={totalWidth * scale}
        height={height + 30}
        viewBox={`0 0 ${totalWidth} ${height + 30}`}
        style={{ maxWidth: '100%' }}
      >
        {bars.map((bar, i) => (
          <rect key={i} x={bar.x} y={0} width={bar.width} height={height} fill="#000" />
        ))}
      </svg>
      <div style={{ marginTop: 4, fontSize: 13 }}>
        <p style={{ fontWeight: 600, margin: 0 }}>{userName}</p>
        {employeeCode && (
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 }}>
            {employeeCode}
          </p>
        )}
        <p style={{ color: '#999', margin: '2px 0 0', fontSize: 10, fontFamily: 'monospace' }}>
          {value.slice(0, 16)}...
        </p>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const isRoot = me?.role === 'ROOT';

  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeUser, setBarcodeUser] = useState<any>(null);
  const [barcodeData, setBarcodeData] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FUNCIONARIO',
    employeeCode: '',
    tenantId: '',
    allowedRestaurantIds: [] as string[],
  });

  const availableRoles = isRoot ? ROLES : ['FISCAL', 'FUNCIONARIO'];

  const load = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [api.get('/users')];
      if (isRoot) promises.push(api.get('/tenants'));
      promises.push(api.get('/restaurants'));

      const [uRes, tRes, rRes] = await Promise.all(
        isRoot ? promises : [promises[0], promises[1]],
      );

      setUsers(uRes.data);
      if (isRoot && tRes) setTenants(tRes.data.filter((t: any) => t.isActive));
      const rData = isRoot ? rRes?.data : tRes?.data;
      setRestaurants(rData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Quando a empresa selecionada muda, recarrega os refeitórios daquela empresa
  const onTenantChange = async (tenantId: string) => {
    setForm((f) => ({ ...f, tenantId, allowedRestaurantIds: [] }));
    if (!tenantId) { setRestaurants([]); return; }
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data.filter((r: any) => r.tenantId === tenantId));
    } catch { setRestaurants([]); }
  };

  const openCreate = () => {
    setEditing(null);
    setError('');
    const defaultTenantId = isRoot ? '' : me?.tenantId || '';
    setForm({
      name: '', email: '', password: '', role: 'FUNCIONARIO',
      employeeCode: '', tenantId: defaultTenantId, allowedRestaurantIds: [],
    });
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setError('');
    setForm({
      name: u.name, email: u.email, password: '',
      role: u.role, employeeCode: u.employeeCode || '',
      tenantId: u.tenantId || '',
      allowedRestaurantIds: (u.allowedRestaurants || []).map((r: any) => r.id),
    });
    if (isRoot && u.tenantId) {
      api.get('/restaurants').then(({ data }) => {
        setRestaurants(data.filter((r: any) => r.tenantId === u.tenantId));
      });
    }
    setShowModal(true);
  };

  const toggleRestaurant = (id: string) => {
    setForm((f) => ({
      ...f,
      allowedRestaurantIds: f.allowedRestaurantIds.includes(id)
        ? f.allowedRestaurantIds.filter((rid) => rid !== id)
        : [...f.allowedRestaurantIds, id],
    }));
  };

  const save = async () => {
    setError('');
    if (isRoot && !editing && !form.tenantId) {
      setError('Selecione a empresa do funcionário.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      if (!isRoot) delete payload.tenantId;

      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Desativar este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao desativar usuário');
    }
  };

  const viewBarcode = async (u: any) => {
    setBarcodeUser(u);
    setBarcodeData(null);
    try {
      const { data } = await api.get(`/users/${u.id}/barcode`);
      setBarcodeData(data);
    } catch {
      setBarcodeData({ userName: u.name, employeeCode: u.employeeCode, barcodeToken: null });
    }
    setShowBarcodeModal(true);
  };

  const regenerateBarcode = async () => {
    if (!confirm('Regenerar código de barras? O código atual se tornará inválido.')) return;
    const { data } = await api.post(`/users/${barcodeUser.id}/regenerate-barcode`);
    setBarcodeData(data);
  };

  const roleBadge: Record<string, string> = {
    ROOT: 'badge-red', GERENTE: 'badge-amber', FUNCIONARIO: 'badge-blue',
  };

  const modalRestaurants = isRoot
    ? restaurants.filter((r) => !form.tenantId || r.tenantId === form.tenantId)
    : restaurants;

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">👥 Funcionários</h1>
          <p className="page-subtitle">Gerencie usuários, empresas e acesso aos refeitórios</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Usuário</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>Nenhum usuário cadastrado</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                {isRoot && <th>Empresa</th>}
                <th>Cód.</th>
                <th>Perfil</th>
                <th>Refeitórios</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-600">{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  {isRoot && <td className="text-muted">{u.tenant?.name || '-'}</td>}
                  <td>{u.employeeCode || '-'}</td>
                  <td><span className={`badge ${roleBadge[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                  <td>
                    {u.allowedRestaurants?.length
                      ? <span className="badge badge-blue">{u.allowedRestaurants.length} refeitório(s)</span>
                      : <span className="badge badge-gray">Todos</span>}
                  </td>
                  <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Ativo' : 'Inativo'}</span></td>
                  <td>
                    <div className="flex gap-8">
                      {(u.role === 'FUNCIONARIO' || u.role === 'FISCAL') && (
                        <button className="btn btn-sm btn-secondary" onClick={() => viewBarcode(u)} title="Ver Crachá">🪪</button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deactivate(u.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>
            )}

            {/* Seletor de empresa — ROOT ao criar */}
            {isRoot && !editing && (
              <div className="form-group">
                <label>Empresa *</label>
                <select
                  value={form.tenantId}
                  onChange={(e) => onTenantChange(e.target.value)}
                >
                  <option value="">Selecione a empresa...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dados básicos */}
            <div className="form-group">
              <label>Nome *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>E-mail *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Senha {editing ? '(deixar em branco para manter)' : '*'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Perfil</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {availableRoles.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cód. Funcionário</label>
                <input value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} placeholder="EMP001" />
              </div>
            </div>

            {/* Seletor de refeitórios permitidos */}
            <div className="form-group">
              <label style={{ marginBottom: 6, display: 'block' }}>
                Refeitórios permitidos
                <span className="text-muted" style={{ fontWeight: 400, marginLeft: 6, fontSize: 11 }}>
                  (nenhum selecionado = acesso a todos)
                </span>
              </label>
              {modalRestaurants.length === 0 ? (
                <p className="text-muted text-sm" style={{ padding: '10px 0' }}>
                  {isRoot && !form.tenantId
                    ? 'Selecione a empresa primeiro.'
                    : 'Nenhum refeitório cadastrado.'}
                </p>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  maxHeight: 200, overflowY: 'auto',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                }}>
                  {modalRestaurants.map((r: any) => (
                    <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={form.allowedRestaurantIds.includes(r.id)}
                        onChange={() => toggleRestaurant(r.id)}
                        style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontWeight: 500 }}>{r.name}</span>
                      {r.location && (
                        <span className="text-muted text-sm">— {r.location}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
              {form.allowedRestaurantIds.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <span className="badge badge-blue">{form.allowedRestaurantIds.length} selecionado(s)</span>
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ marginLeft: 8 }}
                    onClick={() => setForm((f) => ({ ...f, allowedRestaurantIds: [] }))}
                  >
                    Limpar seleção
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : '💾 Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal do Crachá (Código de Barras) ── */}
      {showBarcodeModal && barcodeData && (
        <div className="modal-overlay" onClick={() => setShowBarcodeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">🪪 Crachá — Código de Barras</h2>
              <button className="modal-close" onClick={() => setShowBarcodeModal(false)}>✕</button>
            </div>

            <div style={{ margin: '20px auto', padding: '0 8px' }}>
              {barcodeData.barcodeToken ? (
                <>
                  <div style={{
                    background: '#fff', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '20px 16px',
                    display: 'inline-block', minWidth: 300,
                  }}>
                    <BarcodeDisplay
                      value={barcodeData.barcodeToken}
                      userName={barcodeData.userName}
                      employeeCode={barcodeData.employeeCode}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 20 }}>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 0 }}>
                      Imprima este código de barras e cole no crachá do funcionário.<br />
                      Compatible com leitores <strong>1D e 2D</strong> (Elgin Flash II, Bematech BR520 etc.).
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted">Código de barras não disponível. O usuário pode não ter sido criado como FUNCIONARIO ou FISCAL.</p>
              )}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center', gap: 12 }}>
              {barcodeData.barcodeToken && (
                <button className="btn btn-danger" onClick={regenerateBarcode}>
                  🔄 Regenerar
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowBarcodeModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
