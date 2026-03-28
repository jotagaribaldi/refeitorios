import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ConsumptionsPage() {
  const { user: me } = useAuth();
  const isRoot = me?.role === 'ROOT';

  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-01'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const load = () => {
    setLoading(true);
    api.get(`/consumptions?startDate=${filters.startDate}&endDate=${filters.endDate}`)
      .then((r) => setConsumptions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const mealBadge: Record<string, string> = {
    'cafe-manha': 'badge-amber',
    almoco: 'badge-green',
    'lanche-tarde': 'badge-blue',
    jantar: 'badge-purple',
    'lanche-noite': 'badge-gray',
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📋 Consumos</h1>
          <p className="page-subtitle">Histórico completo de refeições registradas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="flex gap-12 items-center flex-wrap">
          <div className="form-group" style={{ margin: 0 }}>
            <label>Data inicial</label>
            <input type="date" value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Data final</label>
            <input type="date" value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={load}>
            🔍 Filtrar
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : consumptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>Nenhum consumo no período</p>
          </div>
        ) : (
          <>
            <div className="table-toolbar">
              <span className="text-muted text-sm">{consumptions.length} registros encontrados</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Funcionário</th>
                  {isRoot && <th>Empresa</th>}
                  <th>Refeitório</th>
                  <th>Refeição</th>
                </tr>
              </thead>
              <tbody>
                {consumptions.map((c) => (
                  <tr key={c.id}>
                    <td className="text-sm text-muted">
                      {format(new Date(c.consumedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="fw-600">{c.user?.name || '-'}</td>
                    {isRoot && <td className="text-muted">{c.user?.tenant?.name || '-'}</td>}
                    <td>{c.restaurant?.name || '-'}</td>
                    <td>
                      <span className={`badge ${mealBadge[c.mealType?.slug] || 'badge-gray'}`}>
                        {c.mealType?.name || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
