import { useEffect, useState } from 'react';
import api from '../services/api';

const DEFAULT_ICONS: Record<string, string> = {
  'cafe-manha': '☕', almoco: '🍽️', 'lanche-tarde': '🥪', jantar: '🌙', 'lanche-noite': '🌃',
};

export default function MealTypesPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  
  const [mealTypes, setMealTypes] = useState<any[]>([]);
  const [windows, setWindows] = useState<any[]>([]);
  
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const loadBase = () => {
    Promise.all([api.get('/restaurants'), api.get('/meal-types')])
      .then(([rest, types]) => {
        setRestaurants(rest.data);
        setMealTypes(types.data);
        if (rest.data.length > 0 && !selectedRestaurantId) {
          setSelectedRestaurantId(rest.data[0].id);
        }
      });
  };

  const loadWindows = () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    api.get(`/meal-types/time-windows?restaurantId=${selectedRestaurantId}`)
      .then((wins) => {
        const wMap: Record<string, any> = {};
        wins.data.forEach((w: any) => { wMap[w.mealTypeId] = w; });
        
        setWindows(mealTypes.map((t: any) => {
          const w = wMap[t.id];
          return {
            mealTypeId: t.id,
            name: t.name,
            startTime: w?.startTime?.slice(0, 5) || '00:00',
            endTime: w?.endTime?.slice(0, 5) || '00:00',
            allowDuplicate: w?.allowDuplicate || false,
            isActive: w?.isActive ?? false, // Por padrão inativo se não configurado
          };
        }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBase(); }, []);
  useEffect(() => { if (mealTypes.length > 0) loadWindows(); }, [selectedRestaurantId, mealTypes]);

  const update = (idx: number, field: string, value: any) => {
    setWindows((prev) => prev.map((w, i) => i === idx ? { ...w, [field]: value } : w));
  };

  const save = async (idx: number) => {
    const { mealTypeId, startTime, endTime, allowDuplicate, isActive } = windows[idx];
    setSaving(mealTypeId);
    try {
      await api.put('/meal-types/time-windows', {
        mealTypeId,
        startTime,
        endTime,
        allowDuplicate,
        isActive,
        restaurantId: selectedRestaurantId,
      });
      setSaved(mealTypeId);
      setTimeout(() => setSaved(null), 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(null);
    }
  };

  const createType = async () => {
    if (!newTypeName) return;
    try {
      await api.post('/meal-types', { name: newTypeName });
      setShowTypeModal(false);
      setNewTypeName('');
      loadBase();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar tipo');
    }
  };

  const deleteType = async (id: string) => {
    if (!confirm('Excluir este tipo de refeição? Isso removerá horários vinculados em todos os refeitórios.')) return;
    try {
      await api.delete(`/meal-types/${id}`);
      loadBase();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">⏰ Horários por Refeitório</h1>
          <p className="page-subtitle">Configure as janelas de consumo para cada unidade</p>
        </div>
        <div className="flex gap-12">
          <button className="btn btn-secondary" onClick={() => setShowTypeModal(true)}>+ Criar Novo Tipo</button>
        </div>
      </div>

      {/* Seletor de Refeitório */}
      <div className="card" style={{ marginBottom: 24, border: '1px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div className="flex items-center gap-12">
          <span style={{ fontSize: 24 }}>🏢</span>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
              SELECIONE O REFEITÓRIO PARA CONFIGURAR:
            </label>
            <select 
              value={selectedRestaurantId} 
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 16, fontWeight: 700, width: '100%', maxWidth: 400 }}
            >
              <option value="">Selecione...</option>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name} — {r.location}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!selectedRestaurantId ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <p>Selecione um refeitório acima para gerenciar os horários</p>
        </div>
      ) : loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {windows.map((w, i) => {
            const mt = mealTypes.find((m) => m.id === w.mealTypeId);
            const slug = mt?.slug || '';
            const isCustom = mt?.tenantId !== null;

            return (
              <div key={w.mealTypeId} className={`card ${w.isActive ? 'border-active' : ''}`} style={{ transition: 'all 0.3s ease' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                  <div className="flex items-center gap-12">
                    <div className={`stat-icon ${w.isActive ? 'amber' : 'gray'}`} style={{ width: 44, height: 44, fontSize: 20 }}>
                      {DEFAULT_ICONS[slug] || '🍴'}
                    </div>
                    <div>
                      <div className="flex items-center gap-8">
                        <div className="fw-700" style={{ fontSize: 16 }}>{w.name}</div>
                        {isCustom && <span className="badge badge-blue">Custom</span>}
                      </div>
                      <div className="text-muted text-sm">{w.isActive ? 'Janela ativa' : 'Indisponível neste refeitório'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                     {isCustom && (
                        <button className="btn btn-sm btn-danger-ghost" onClick={() => deleteType(w.mealTypeId)} title="Excluir este tipo permanentemente">🗑️</button>
                     )}
                    <label className="flex items-center gap-8 switch-container" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={w.isActive}
                        onChange={(e) => update(i, 'isActive', e.target.checked)}
                      />
                      <span className="fw-600">HABILITAR</span>
                    </label>
                  </div>
                </div>

                <div className={`grid-3 ${!w.isActive ? 'opacity-50 pointer-events-none' : ''}`} style={{ gap: 16, alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Hora de Início</label>
                    <input type="time" value={w.startTime} onChange={(e) => update(i, 'startTime', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Hora de Término</label>
                    <input type="time" value={w.endTime} onChange={(e) => update(i, 'endTime', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label className="flex items-center gap-8" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={w.allowDuplicate}
                        onChange={(e) => update(i, 'allowDuplicate', e.target.checked)}
                      />
                      <span className="text-sm">Consumo múltiplo/dia</span>
                    </label>
                    <button
                      className="btn btn-primary"
                      onClick={() => save(i)}
                      disabled={saving === w.mealTypeId}
                      style={{ width: '100%' }}
                    >
                      {saved === w.mealTypeId ? '✅ Atualizado' : saving === w.mealTypeId ? 'Salvando...' : '💾 Atualizar Horário'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo Tipo */}
      {showTypeModal && (
        <div className="modal-overlay" onClick={() => setShowTypeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Tipo de Refeição</h2>
              <button className="modal-close" onClick={() => setShowTypeModal(false)}>✕</button>
            </div>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
              Crie um novo nome de refeição (ex: "Almoço Executivo", "Ceia").
              Após criado, você poderá definir o horário dele acima para cada refeitório.
            </p>
            <div className="form-group">
              <label>Nome do Tipo *</label>
              <input 
                autoFocus 
                value={newTypeName} 
                onChange={(e) => setNewTypeName(e.target.value)} 
                placeholder="Ex: Lanche da Madrugada"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={createType} disabled={!newTypeName}>Criar Tipo</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .border-active { border-left: 4px solid var(--warning) !important; }
        .switch-container { background: var(--bg-elevated); padding: 4px 12px; border-radius: 999px; }
        .btn-danger-ghost { background: transparent; border: none; font-size: 16px; cursor: pointer; padding: 4px; border-radius: 4px; }
        .btn-danger-ghost:hover { background: rgba(239, 68, 68, 0.1); }
      `}</style>
    </div>
  );
}
