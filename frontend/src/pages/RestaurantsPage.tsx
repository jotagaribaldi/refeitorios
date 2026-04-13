import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RestaurantsPage() {
  const { user } = useAuth();
  const isRoot = user?.role === 'ROOT';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQr, setShowQr] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', location: '', tenantId: '' });
  const [qrData, setQrData] = useState<{ qrCodeToken: string; qrDataUrl: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const promises: Promise<any>[] = [api.get('/api/restaurants')];
    if (isRoot) promises.push(api.get('/tenants'));
    Promise.all(promises)
      .then(([rRes, tRes]) => {
        setRestaurants(rRes.data);
        if (tRes) setTenants(tRes.data.filter((t: any) => t.isActive));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setError('');
    setForm({ name: '', location: '', tenantId: '' });
    setShowModal(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setError('');
    setForm({ name: r.name, location: r.location || '', tenantId: r.tenantId || '' });
    setShowModal(true);
  };

  const save = async () => {
    setError('');
    if (isRoot && !editing && !form.tenantId) {
      setError('Selecione a empresa para este refeitório.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (!payload.tenantId) delete payload.tenantId;

      if (editing) {
        await api.put(`/api/restaurants/${editing.id}`, { name: form.name, location: form.location });
      } else {
        await api.post('/api/restaurants', payload);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const viewQr = async (r: any) => {
    const { data } = await api.get(`/restaurants/${r.id}/qrcode`);
    setQrData(data);
    setShowQr(r);
  };

  const regenerateQr = async (r: any) => {
    if (!confirm('Regenerar QR Code? O QR Code atual se tornará inválido.')) return;
    const { data } = await api.post(`/restaurants/${r.id}/regenerate-qr`);
    setQrData(data);
  };

  const remove = async (id: string) => {
    if (!confirm('Desativar este refeitório?')) return;
    await api.delete(`/restaurants/${id}`);
    load();
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🍽️ Refeitórios</h1>
          <p className="page-subtitle">Gerencie os refeitórios e seus QR Codes</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Refeitório</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <p>Nenhum refeitório cadastrado</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                {isRoot && <th>Empresa</th>}
                <th>Localização</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id}>
                  <td className="fw-600">{r.name}</td>
                  {isRoot && (
                    <td className="text-muted">{r.tenant?.name || r.tenantId?.slice(0, 8) || '-'}</td>
                  )}
                  <td>{r.location || '-'}</td>
                  <td>
                    <span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>
                      {r.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-sm btn-secondary" onClick={() => viewQr(r)} title="Ver QR Code">📲</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Editar Refeitório' : 'Novo Refeitório'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>
            )}

            {/* Seletor de empresa — apenas ROOT ao criar */}
            {isRoot && !editing && (
              <div className="form-group">
                <label>Empresa *</label>
                <select
                  value={form.tenantId}
                  onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
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
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Refeitório Central"
              />
            </div>
            <div className="form-group">
              <label>Localização</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Bloco A - Térreo"
              />
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

      {/* Modal QR Code */}
      {showQr && qrData && (
        <div className="modal-overlay" onClick={() => setShowQr(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h2 className="modal-title">QR Code — {showQr.name}</h2>
              <button className="modal-close" onClick={() => setShowQr(null)}>✕</button>
            </div>

            <div className="qr-container">
              <QRCodeSVG
                value={JSON.stringify({ restaurantId: showQr.id, token: qrData.qrCodeToken })}
                size={220}
                level="H"
              />
              <p style={{ fontSize: 11, color: '#333', wordBreak: 'break-all', maxWidth: 220 }}>
                {showQr.name}
              </p>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-danger" onClick={() => regenerateQr(showQr)}>
                🔄 Regenerar QR
              </button>
              <button className="btn btn-secondary" onClick={() => setShowQr(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
