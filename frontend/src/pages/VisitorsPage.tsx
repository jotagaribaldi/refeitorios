import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Renderiza código de barras Code 128 via JsBarcode
function BarcodeDisplay({ value, userName, employeeCode }: { value: string; userName: string; employeeCode?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: false,
        margin: 12,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch (e) {
      console.error('Erro ao gerar código de barras:', e);
    }
  }, [value]);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg ref={svgRef} style={{ maxWidth: '100%' }} />
      <div style={{ marginTop: 8, fontSize: 13 }}>
        <p style={{ fontWeight: 600, margin: 0 }}>{userName}</p>
        {employeeCode && (
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 }}>
            {employeeCode}
          </p>
        )}
      </div>
    </div>
  );
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Função utilitária para gerar o próximo código sequencial de visitante (VIS00xxx)
const generateNextVisitorCode = (existingVisitors: any[]) => {
  let maxNum = 0;
  existingVisitors.forEach((v) => {
    if (v.employeeCode && v.employeeCode.startsWith('VIS')) {
      const numStr = v.employeeCode.replace('VIS', '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  return `VIS${String(nextNum).padStart(5, '0')}`;
};

export default function VisitorsPage() {
  const { user: me } = useAuth();
  const isRoot = me?.role === 'ROOT';

  const [visitors, setVisitors] = useState<any[]>([]);
  const [allowances, setAllowances] = useState<any[]>([]);
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

  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    employeeCode: '',
    tenantId: '',
    totalAllowance: 0,
    allowedRestaurantIds: [] as string[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        api.get('/users'),
        api.get(`/allowances?year=${year}&month=${month}`),
        api.get('/restaurants'),
      ];
      if (isRoot) promises.push(api.get('/tenants'));

      const [uRes, aRes, rRes, tRes] = await Promise.all(promises);

      // Filtra apenas VISITANTE
      const visitorsOnly = uRes.data.filter((u: any) => u.role === 'VISITANTE');
      setVisitors(visitorsOnly);
      setAllowances(aRes.data);
      
      const rData = rRes.data;
      setRestaurants(rData || []);

      if (isRoot && tRes) {
        setTenants(tRes.data.filter((t: any) => t.isActive));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onTenantChange = async (tenantId: string) => {
    setForm((f) => ({ ...f, tenantId, allowedRestaurantIds: [] }));
    if (!tenantId) {
      setRestaurants([]);
      return;
    }
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data.filter((r: any) => r.tenantId === tenantId));
    } catch {
      setRestaurants([]);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setError('');
    const defaultTenantId = isRoot ? '' : me?.tenantId || '';
    const nextCode = generateNextVisitorCode(visitors);
    setForm({
      name: '',
      // E-mail aleatório único para preencher no banco
      email: `visitante_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@visitantes.com`,
      // Senha aleatória para preencher no banco
      password: `visitor_${Math.random().toString(36).substring(2, 10)}`,
      employeeCode: nextCode,
      tenantId: defaultTenantId,
      totalAllowance: 10, // Saldo inicial padrão sugerido
      allowedRestaurantIds: [],
    });
    setShowModal(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setError('');
    const allowance = allowances.find((a) => a.userId === v.id);
    setForm({
      name: v.name,
      email: v.email,
      password: '',
      employeeCode: v.employeeCode || '',
      tenantId: v.tenantId || '',
      totalAllowance: allowance ? allowance.totalAllowance : 0,
      allowedRestaurantIds: (v.allowedRestaurants || []).map((r: any) => r.id),
    });
    if (isRoot && v.tenantId) {
      api.get('/restaurants').then(({ data }) => {
        setRestaurants(data.filter((r: any) => r.tenantId === v.tenantId));
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
      setError('Selecione a empresa do visitante.');
      return;
    }
    if (!form.name || !form.email) {
      setError('Nome e E-mail são obrigatórios.');
      return;
    }
    if (!editing && !form.password) {
      setError('A senha é obrigatória para novos cadastros.');
      return;
    }
    setSaving(true);
    try {
      const userPayload: any = {
        name: form.name,
        email: form.email,
        role: 'VISITANTE',
        employeeCode: form.employeeCode || undefined,
        allowedRestaurantIds: form.allowedRestaurantIds,
      };
      if (form.password) {
        userPayload.password = form.password;
      }
      if (isRoot) {
        userPayload.tenantId = form.tenantId;
      }

      let savedUser;
      if (editing) {
        savedUser = await api.put(`/users/${editing.id}`, userPayload);
      } else {
        savedUser = await api.post('/users', userPayload);
      }

      const targetUserId = editing ? editing.id : savedUser.data.id;

      // Cria ou atualiza saldo mensal de refeições se inserido
      if (form.totalAllowance > 0) {
        const allowance = allowances.find((a) => a.userId === targetUserId);
        if (allowance) {
          // Atualiza saldo
          await api.put(`/allowances/${allowance.id}`, { totalAllowance: form.totalAllowance });
        } else {
          // Cria novo
          await api.post('/allowances', {
            userId: targetUserId,
            year,
            month,
            totalAllowance: form.totalAllowance,
          });
        }
      }

      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar visitante');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Desativar este visitante?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao desativar visitante');
    }
  };

  const viewBarcode = async (v: any) => {
    setBarcodeUser(v);
    setBarcodeData(null);
    try {
      const { data } = await api.get(`/users/${v.id}/barcode`);
      setBarcodeData(data);
    } catch {
      setBarcodeData({ userName: v.name, employeeCode: v.employeeCode, barcodeToken: null });
    }
    setShowBarcodeModal(true);
  };

  const regenerateBarcode = async () => {
    if (!confirm('Regenerar crachá do visitante? O código atual se tornará inválido.')) return;
    const { data } = await api.post(`/users/${barcodeUser.id}/regenerate-barcode`);
    setBarcodeData(data);
  };

  const modalRestaurants = isRoot
    ? restaurants.filter((r) => !form.tenantId || r.tenantId === form.tenantId)
    : restaurants;

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🎫 Visitantes</h1>
          <p className="page-subtitle">Cadastre visitantes temporários e atribua saldo para utilização do refeitório</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Visitante</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : visitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎫</div>
            <p>Nenhum visitante cadastrado</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                {isRoot && <th>Empresa</th>}
                <th>Cód. Visitante</th>
                <th>Saldo de Refeição ({MONTHS[month - 1]})</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => {
                const allowance = allowances.find((a) => a.userId === v.id);
                const remaining = allowance ? (allowance.totalAllowance - allowance.consumed) : 0;
                const total = allowance ? allowance.totalAllowance : 0;
                
                return (
                  <tr key={v.id}>
                    <td className="fw-600">{v.name}</td>
                    {isRoot && <td className="text-muted">{v.tenant?.name || '-'}</td>}
                    <td>{v.employeeCode || '-'}</td>
                    <td>
                      {allowance ? (
                        <span className={`badge ${remaining === 0 ? 'badge-red' : remaining < 3 ? 'badge-amber' : 'badge-green'}`}>
                          {remaining} / {total} restante(s)
                        </span>
                      ) : (
                        <span className="badge badge-gray">Nenhum saldo</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${v.isActive ? 'badge-green' : 'badge-red'}`}>
                        {v.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-sm btn-secondary" onClick={() => viewBarcode(v)} title="Ver Crachá">🪪</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(v)} title="Editar">✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deactivate(v.id)} title="Desativar">🗑️</button>
                      </div>
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
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Editar Visitante' : 'Novo Visitante'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>
            )}

            {/* Empresa — ROOT ao criar */}
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

            <div className="form-group">
              <label>Nome *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome Completo" />
            </div>

            <div className="form-group">
              <label>Código do Visitante (Gerado Automaticamente)</label>
              <input 
                value={form.employeeCode} 
                disabled 
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#4b5563' }} 
                placeholder="Gerando automaticamente..." 
              />
            </div>

            <div className="form-group">
              <label>Saldo de Refeição para {MONTHS[month - 1]}/{year} (Mês Atual)</label>
              <input 
                type="number" 
                min="0" 
                max="200" 
                value={form.totalAllowance} 
                onChange={(e) => setForm({ ...form, totalAllowance: +e.target.value })} 
              />
              <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                Cadastre a quantidade de refeições que o visitante terá direito de consumir este mês.
              </p>
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
                  maxHeight: 160, overflowY: 'auto',
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

      {/* Modal do Crachá (Código de Barras) */}
      {showBarcodeModal && barcodeData && (
        <div className="modal-overlay" onClick={() => setShowBarcodeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">🪪 Crachá do Visitante</h2>
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
                      Imprima este crachá para o visitante utilizar os leitores do refeitório.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted">Código de barras não disponível para este visitante.</p>
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
