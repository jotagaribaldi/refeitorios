import { useEffect, useState } from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const MEAL_META: Record<string, { icon: string; cls: string; pill: string }> = {
  'cafe-manha':   { icon: '☕', cls: 'cafe',    pill: 'pill-amber'  },
  'almoco':       { icon: '🍽️', cls: 'almoco',  pill: 'pill-green'  },
  'lanche-tarde': { icon: '🥪', cls: 'lanche',  pill: 'pill-blue'   },
  'jantar':       { icon: '🌙', cls: 'jantar',  pill: 'pill-purple' },
  'lanche-noite': { icon: '🌃', cls: 'noite',   pill: 'pill-red'    },
};

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';
  return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export default function HistoryPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/consumptions/me')
      .then((r) => setConsumptions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Agrupa por data
  const grouped: Record<string, any[]> = {};
  consumptions.forEach((c) => {
    const key = c.date || c.consumedAt?.split('T')[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="scroll-view">
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Histórico</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {consumptions.length} refeições registradas
        </p>
      </div>

      {/* Resumo rápido */}
      {!loading && consumptions.length > 0 && (
        <div style={{ padding: '14px 16px', display: 'flex', gap: 10, overflowX: 'auto' }}>
          {Object.entries(MEAL_META).map(([slug, meta]) => {
            const count = consumptions.filter((c) => c.mealType?.slug === slug).length;
            if (count === 0) return null;
            return (
              <div key={slug} style={{
                flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '10px 14px', textAlign: 'center', minWidth: 72,
              }}>
                <div style={{ fontSize: 22 }}>{meta.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {slug === 'cafe-manha' ? 'Cafés' :
                   slug === 'almoco' ? 'Almoços' :
                   slug === 'lanche-tarde' ? 'Lanches' :
                   slug === 'jantar' ? 'Jantares' : 'Noite'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="section" style={{ marginTop: 8 }}>
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <span>Carregando histórico...</span>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">Nenhuma refeição registrada</div>
            <div className="empty-sub">Escaneie o QR Code para começar</div>
          </div>
        ) : sortedDates.map((date) => (
          <div key={date}>
            <div className="date-divider">{dateLabel(date)}</div>
            {grouped[date].map((c: any) => {
              const meta = MEAL_META[c.mealType?.slug] || { icon: '🍴', cls: 'almoco', pill: 'pill-green' };
              return (
                <div key={c.id} className="meal-item" style={{ cursor: 'default' }}>
                  <div className={`meal-icon-wrap ${meta.cls}`}>{meta.icon}</div>
                  <div className="meal-info">
                    <div className="meal-name">{c.mealType?.name || 'Refeição'}</div>
                    <div className="meal-meta">📍 {c.restaurant?.name || '-'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="meal-time">{format(new Date(c.consumedAt), 'HH:mm')}</div>
                    <span className={`pill ${meta.pill}`} style={{ fontSize: 9, marginTop: 4 }}>✓</span>
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
