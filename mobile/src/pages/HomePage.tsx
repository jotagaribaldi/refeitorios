import { useEffect, useState } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MEAL_META: Record<string, { icon: string; cls: string; pill: string }> = {
  'cafe-manha':   { icon: '☕', cls: 'cafe',    pill: 'pill-amber' },
  'almoco':       { icon: '🍽️', cls: 'almoco',   pill: 'pill-green' },
  'lanche-tarde': { icon: '🥪', cls: 'lanche',   pill: 'pill-blue'  },
  'jantar':       { icon: '🌙', cls: 'jantar',   pill: 'pill-purple'},
  'lanche-noite': { icon: '🌃', cls: 'noite',    pill: 'pill-red'   },
};

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';
  return format(d, "d 'de' MMMM", { locale: ptBR });
}

export default function HomePage({ onScan }: { onScan: () => void }) {
  const { user } = useAuth();
  const [allowance, setAllowance] = useState<any>(null);
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consRes, allowRes] = await Promise.all([
          api.get('/consumptions/me'),
          api.get(`/allowances?year=${now.getFullYear()}&month=${now.getMonth() + 1}`),
        ]);
        setConsumptions(consRes.data.slice(0, 30));

        // Encontra o saldo do usuário logado
        const myAllowance = allowRes.data.find(
          (a: any) => a.userId === user?.id || a.user?.id === user?.id
        );
        setAllowance(myAllowance || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Agrupa consumos por data
  const grouped: Record<string, any[]> = {};
  consumptions.forEach((c) => {
    const key = c.date || c.consumedAt?.split('T')[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const remaining = allowance ? allowance.totalAllowance - allowance.consumed : 0;
  const usedPct = allowance && allowance.totalAllowance > 0
    ? (allowance.consumed / allowance.totalAllowance) * 100 : 0;
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <div className="scroll-view">
      {/* Hero Balance */}
      <div className="balance-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div className="balance-label">Saldo disponível</div>
          <div className="balance-month">{months[now.getMonth()]} {now.getFullYear()}</div>
        </div>

        {loading ? (
          <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner spinner-sm" />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Carregando...</span>
          </div>
        ) : allowance ? (
          <>
            <div className="balance-row">
              <span className="balance-value">{remaining}</span>
              <span className="balance-unit">refeições</span>
            </div>

            <div className="balance-progress-wrap">
              <div className="balance-progress-labels">
                <span>Consumido: {allowance.consumed}</span>
                <span>Total: {allowance.totalAllowance}</span>
              </div>
              <div className="balance-progress-track">
                <div
                  className="balance-progress-fill"
                  style={{ width: `${Math.min(usedPct, 100)}%` }}
                />
              </div>
            </div>

            <div className="balance-stats">
              <div className="balance-stat">
                <div className="balance-stat-label">Consumidas</div>
                <div className="balance-stat-value">{allowance.consumed}</div>
              </div>
              <div className="balance-stat">
                <div className="balance-stat-label">Restantes</div>
                <div className="balance-stat-value" style={{ color: remaining === 0 ? 'var(--danger)' : remaining < 5 ? 'var(--warning)' : 'var(--primary)' }}>
                  {remaining}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '16px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Saldo não configurado para este mês.{'\n'}Contate o gerente.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={onScan}>
          <span className="qa-icon">📲</span>
          <span className="qa-label">Escanear QR</span>
          <span className="qa-sub">Registrar refeição</span>
        </button>
        <div className="quick-action-btn" style={{ cursor: 'default' }}>
          <span className="qa-icon">📋</span>
          <span className="qa-label">Histórico</span>
          <span className="qa-sub">{consumptions.length} registros</span>
        </div>
      </div>

      {/* Consumos recentes */}
      <div className="section">
        <div className="section-title">Histórico de refeições</div>

        {loading ? (
          <div className="loading-screen" style={{ padding: '40px 0' }}>
            <div className="spinner" />
            <span>Carregando...</span>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <div className="empty-text">Nenhuma refeição registrada</div>
            <div className="empty-sub">Escaneie o QR Code do refeitório</div>
          </div>
        ) : sortedDates.map((date) => (
          <div key={date}>
            <div className="date-divider">{dateLabel(date)}</div>
            {grouped[date].map((c: any) => {
              const meta = MEAL_META[c.mealType?.slug] || { icon: '🍴', cls: 'almoco', pill: 'pill-green' };
              return (
                <div key={c.id} className="meal-item">
                  <div className={`meal-icon-wrap ${meta.cls}`}>{meta.icon}</div>
                  <div className="meal-info">
                    <div className="meal-name">{c.mealType?.name || 'Refeição'}</div>
                    <div className="meal-meta">{c.restaurant?.name || '-'}</div>
                  </div>
                  <div className="meal-time">
                    {format(new Date(c.consumedAt), 'HH:mm')}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
