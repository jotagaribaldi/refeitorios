import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard?year=${year}&month=${month}`)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  if (loading) return (
    <div className="loading-state"><div className="spinner" /></div>
  );

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📊 Dashboard</h1>
          <p className="page-subtitle">Visão geral do consumo</p>
        </div>
        <div className="flex gap-8">
          <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ width: 140 }}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} style={{ width: 100 }}>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">🍽️</div>
          <div className="stat-info">
            <div className="stat-value">{data?.totalConsumedMonth ?? 0}</div>
            <div className="stat-label">Refeições no mês</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <div className="stat-value">{data?.allowances?.length ?? 0}</div>
            <div className="stat-label">Funcionários com saldo</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">🏪</div>
          <div className="stat-info">
            <div className="stat-value">{data?.byRestaurant?.length ?? 0}</div>
            <div className="stat-label">Refeitórios ativos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📈</div>
          <div className="stat-info">
            <div className="stat-value">
              {data?.allowances?.reduce((s: number, a: any) => s + (a.totalAllowance - a.consumed), 0) ?? 0}
            </div>
            <div className="stat-label">Saldo total restante</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Por tipo de refeição</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.byMealType ?? []}
                  dataKey="total"
                  nameKey="mealType"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  label={({ name, value }: any) => `${name}: ${value}`}
                >
                  {(data?.byMealType ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Por refeitório</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.byRestaurant ?? []}>
                <XAxis dataKey="restaurant" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top employees */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top 10 Funcionários (consumo)</h3>
        </div>
        {data?.byEmployee?.length ? (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Funcionário</th>
                <th>Refeições</th>
              </tr>
            </thead>
            <tbody>
              {data.byEmployee.map((e: any, i: number) => (
                <tr key={i}>
                  <td><span className="badge badge-green">{i + 1}</span></td>
                  <td className="fw-600">{e.employee}</td>
                  <td>{e.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>Sem dados no período</p>
          </div>
        )}
      </div>
    </div>
  );
}
