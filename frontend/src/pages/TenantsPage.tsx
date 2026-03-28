import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', cnpj: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/tenants').then((r) => setTenants(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', cnpj: '', phone: '' });
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, cnpj: t.cnpj || '', phone: t.phone || '' });
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/tenants/${editing.id}`, form);
      } else {
        await api.post('/tenants', form);
      }
      setAlert({ type: 'success', msg: `Empresa ${editing ? 'atualizada' : 'criada'} com sucesso!` });
      setShowModal(false);
      load();
    } catch (err: any) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Desativar esta empresa?')) return;
    await api.delete(`/tenants/${id}`);
    load();
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🏢 Empresas</h1>
          <p className="page-subtitle">Gerencie os tenants do sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nova Empresa</button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.msg}
          <button className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setAlert(null)}>✕</button>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : tenants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <p>Nenhuma empresa cadastrada</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>E-mail</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td className="fw-600">{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.cnpj || '-'}</td>
                  <td>{t.phone || '-'}</td>
                  <td>
                    <span className={`badge ${t.isActive ? 'badge-green' : 'badge-red'}`}>
                      {t.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(t)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deactivate(t.id)}>🗑️</button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Editar Empresa' : 'Nova Empresa'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Nome da empresa *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Empresa S.A." />
            </div>
            <div className="form-group">
              <label>E-mail *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>CNPJ</label>
                <input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
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
    </div>
  );
}
