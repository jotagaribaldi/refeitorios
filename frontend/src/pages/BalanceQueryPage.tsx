import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

type ScanMode = 'hid' | 'camera' | 'manual';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const mealBadge: Record<string, string> = {
  'cafe-manha': 'badge-amber',
  almoco: 'badge-green',
  'lanche-tarde': 'badge-blue',
  jantar: 'badge-purple',
  'lanche-noite': 'badge-gray',
};

export default function BalanceQueryPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('hid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [manualToken, setManualToken] = useState('');

  // ── HID Barcode Scanner state ──
  const hidBufferRef = useRef('');
  const hidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScan = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await api.post('/consumptions/balance-query', { barcodeToken: trimmed });
      setResult(data);
    } catch (err: any) {
      let msg = 'Erro ao consultar saldo';
      if (err.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m.join(', ') : m;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── HID Keyboard listener ──
  useEffect(() => {
    if (scanMode !== 'hid') return;
    const HID_MAX_CHAR_INTERVAL = 300;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Enter') {
        if (hidBufferRef.current.length > 0) {
          e.preventDefault();
          const scannedValue = hidBufferRef.current;
          hidBufferRef.current = '';
          if (hidTimerRef.current) clearTimeout(hidTimerRef.current);
          handleScan(scannedValue);
        }
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        hidBufferRef.current += e.key;
      }

      if (hidTimerRef.current) clearTimeout(hidTimerRef.current);
      hidTimerRef.current = setTimeout(() => {
        if (hidBufferRef.current.length >= 3) handleScan(hidBufferRef.current);
        hidBufferRef.current = '';
      }, HID_MAX_CHAR_INTERVAL);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (hidTimerRef.current) clearTimeout(hidTimerRef.current);
      hidBufferRef.current = '';
    };
  }, [scanMode, handleScan]);

  // ── Camera ──
  const startCamera = () => {
    setScanMode('camera');
    setError(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('bq-qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText) => { scanner.clear(); setScanMode('hid'); handleScan(decodedText); },
        (err) => console.debug(err),
      );
      scannerRef.current = scanner;
    }, 100);
  };

  const stopCamera = () => { scannerRef.current?.clear(); setScanMode('hid'); };
  useEffect(() => () => { scannerRef.current?.clear(); }, []);

  const clearResult = () => { setResult(null); setError(null); };

  // ── Helpers ──
  const balancePct = result?.allowance
    ? Math.round((result.allowance.consumed / result.allowance.total) * 100)
    : 0;
  const balanceColor = result?.allowance
    ? result.allowance.remaining === 0
      ? '#ef4444'
      : result.allowance.remaining <= 2
      ? '#f59e0b'
      : '#10b981'
    : '#10b981';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💳 Consultar Saldo</h1>
        <p className="page-subtitle">
          Escaneie o crachá do funcionário para visualizar saldo e consumos do mês
        </p>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* ── Scan Mode Tabs ── */}
        <div className="scan-mode-tabs">
          <button
            className={`scan-mode-tab ${scanMode === 'hid' ? 'active' : ''}`}
            onClick={() => { stopCamera(); setScanMode('hid'); clearResult(); }}
          >
            <span className="scan-mode-tab-icon">🔌</span>
            <span>Leitor USB</span>
          </button>
          <button
            className={`scan-mode-tab ${scanMode === 'camera' ? 'active' : ''}`}
            onClick={() => startCamera()}
          >
            <span className="scan-mode-tab-icon">📷</span>
            <span>Câmera</span>
          </button>
          <button
            className={`scan-mode-tab ${scanMode === 'manual' ? 'active' : ''}`}
            onClick={() => { stopCamera(); setScanMode('manual'); clearResult(); }}
          >
            <span className="scan-mode-tab-icon">⌨️</span>
            <span>Manual</span>
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="scan-result-banner scan-result-error" style={{ marginBottom: 20 }}>
            <div className="scan-result-icon">❌</div>
            <div className="scan-result-text">{error}</div>
          </div>
        )}

        {/* ── HID Mode ── */}
        {scanMode === 'hid' && !result && (
          <div className="card scan-hid-card">
            <div className="scan-hid-visual">
              <div className={`scan-hid-ring ${loading ? 'processing' : 'listening'}`}>
                <div className="scan-hid-ring-inner">
                  <span className="scan-hid-icon">{loading ? '⏳' : '💳'}</span>
                </div>
              </div>
              <div className="scan-hid-status">
                {loading ? (
                  <>
                    <span className="scan-hid-status-label processing">Consultando...</span>
                    <span className="scan-hid-status-sub">Buscando dados do funcionário</span>
                  </>
                ) : (
                  <>
                    <span className="scan-hid-status-label listening">
                      <span className="scan-hid-dot" />
                      Aguardando leitura
                    </span>
                    <span className="scan-hid-status-sub">
                      Aponte o leitor para o código de barras do crachá
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="scan-hid-device-info">
              <div className="scan-hid-device-badge">
                <span>🔌</span>
                <span>Leitor de Código de Barras USB</span>
                <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>Consulta</span>
              </div>
              <p className="scan-hid-device-hint">
                Nenhum consumo será registrado — apenas consulta de saldo e histórico do mês corrente.
              </p>
            </div>
          </div>
        )}

        {/* ── Camera Mode ── */}
        {scanMode === 'camera' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div id="bq-qr-reader" />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
                Aponte a câmera para o código de barras do crachá
              </p>
              <button className="btn btn-danger" onClick={stopCamera}>✕ Parar câmera</button>
            </div>
          </div>
        )}

        {/* ── Manual Mode ── */}
        {scanMode === 'manual' && !result && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="card-title" style={{ marginBottom: 12 }}>🔢 Inserir token manualmente</h3>
            <div className="form-group">
              <label>Token do crachá</label>
              <input
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Cole ou digite o token aqui..."
                onKeyDown={(e) => { if (e.key === 'Enter' && manualToken) { handleScan(manualToken); setManualToken(''); } }}
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { handleScan(manualToken); setManualToken(''); }}
              disabled={!manualToken || loading}
            >
              {loading ? 'Consultando...' : '🔍 Consultar Saldo'}
            </button>
          </div>
        )}

        {/* ── Result Card ── */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Employee Header */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #4f46e5))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {result.employee.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
                    {result.employee.name}
                  </div>
                  {result.employee.employeeCode && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      Matrícula: <strong style={{ fontFamily: 'monospace' }}>{result.employee.employeeCode}</strong>
                    </div>
                  )}
                </div>
                <button className="btn btn-secondary" onClick={clearResult} title="Nova consulta">
                  🔄 Nova consulta
                </button>
              </div>
            </div>

            {/* Balance Card */}
            {result.allowance ? (
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
                  Saldo — {MONTH_NAMES[result.allowance.month - 1]} {result.allowance.year}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {result.allowance.consumed} de {result.allowance.total} refeições consumidas
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: balanceColor }}>
                      {balancePct}%
                    </span>
                  </div>
                  <div style={{
                    height: 10, borderRadius: 5,
                    background: 'var(--border)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${balancePct}%`,
                      background: balanceColor,
                      borderRadius: 5,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid-2" style={{ gap: 12 }}>
                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 10, padding: '14px 16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                      Consumido no Mês
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>
                      {result.allowance.consumed}
                      <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>
                        /{result.allowance.total}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    background: result.allowance.remaining === 0
                      ? 'rgba(239,68,68,0.08)'
                      : 'rgba(16,185,129,0.08)',
                    border: `1px solid ${result.allowance.remaining === 0 ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                    borderRadius: 10, padding: '14px 16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: balanceColor, fontWeight: 600, marginBottom: 6 }}>
                      Saldo Disponível
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: balanceColor }}>
                      {result.allowance.remaining}
                      <span style={{ fontSize: 14, fontWeight: 400 }}> refeições</span>
                    </div>
                  </div>
                </div>

                {result.allowance.remaining === 0 && (
                  <div style={{
                    marginTop: 14, padding: '10px 14px',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, textAlign: 'center',
                    fontSize: 13, color: '#ef4444', fontWeight: 600,
                  }}>
                    ⚠️ Saldo esgotado para este mês
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <p className="text-muted">Saldo mensal não configurado para este funcionário.</p>
              </div>
            )}

            {/* Consumption history */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
                Consumos no Mês Corrente
                <span style={{
                  marginLeft: 10, background: 'var(--primary)', color: '#fff',
                  borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                }}>
                  {result.consumptions.length}
                </span>
              </div>

              {result.consumptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
                  <p className="text-muted text-sm">Nenhum consumo registrado neste mês.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.consumptions.map((c: any) => (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {c.mealType?.name || '-'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {c.restaurant?.name || '-'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {format(new Date(c.consumedAt), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {format(new Date(c.consumedAt), "HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      <span className={`badge ${mealBadge[c.mealType?.slug] || 'badge-gray'}`}>
                        {c.mealType?.name || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
