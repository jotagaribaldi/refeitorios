import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

export default function MyConsumptionsPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/consumptions/me').then((r) => setConsumptions(r.data)).finally(() => setLoading(false));
  }, []);

  const mealBadge: Record<string, string> = {
    'cafe-manha': 'badge-amber', almoco: 'badge-green',
    'lanche-tarde': 'badge-blue', jantar: 'badge-purple', 'lanche-noite': 'badge-gray',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Meus Consumos</h1>
        <p className="page-subtitle">Histórico das suas refeições</p>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : consumptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <p>Nenhum consumo registrado ainda</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Refeitório</th>
                <th>Refeição</th>
              </tr>
            </thead>
            <tbody>
              {consumptions.map((c) => (
                <tr key={c.id}>
                  <td className="text-muted text-sm">
                    {format(new Date(c.consumedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="fw-600">{c.restaurant?.name || '-'}</td>
                  <td>
                    <span className={`badge ${mealBadge[c.mealType?.slug] || 'badge-gray'}`}>
                      {c.mealType?.name || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
