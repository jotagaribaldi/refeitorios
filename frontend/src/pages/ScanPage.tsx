import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

type ScanMode = 'hid' | 'camera' | 'manual';

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('hid');
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [lastMeal, setLastMeal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // ── HID Barcode Scanner state ──
  const hidBufferRef = useRef('');
  const hidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [scanCount, setScanCount] = useState(0);

  // ── Process scanned barcode result ──
  const handleQrResult = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/consumptions/scan', { barcodeToken: trimmed });
      setLastMeal(data);
      setResult({ type: 'success', msg: 'Refeição registrada com sucesso! ✅' });
      setLastScanTime(new Date());
      setScanCount((c) => c + 1);
    } catch (err: any) {
      let errorMessage = 'Erro ao registrar consumo';
      if (err.response?.status === 500) {
        errorMessage = 'Erro interno no servidor.';
      } else if (err.response?.data?.message) {
        const msg = err.response.data.message;
        errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setResult({ type: 'error', msg: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);


  // ── HID Keyboard listener ──
  // Bematech/Elgin BR520 simulates keyboard input and sends Enter at the end.
  // Characters arrive in rapid succession (<50ms between keystrokes).
  // We use a buffer + timer approach to distinguish scanner input from human typing.
  useEffect(() => {
    if (scanMode !== 'hid') return;

    const HID_MAX_CHAR_INTERVAL = 300; // ms – increased to accommodate slower scanners/system lag

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if a text input/textarea is focused (manual input mode)
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      // Ignore browser shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Prevent default for scanner characters to avoid any side effects
      if (e.key === 'Enter') {
        if (hidBufferRef.current.length > 0) {
          e.preventDefault();
          const scannedValue = hidBufferRef.current;
          hidBufferRef.current = '';
          if (hidTimerRef.current) clearTimeout(hidTimerRef.current);
          handleQrResult(scannedValue);
        }
        return;
      }

      // Only accept printable characters
      if (e.key.length === 1) {
        e.preventDefault();
        hidBufferRef.current += e.key;
      }

      // Reset the timer on ANY keystroke (including Shift) to keep the scan window open
      if (hidTimerRef.current) clearTimeout(hidTimerRef.current);
      hidTimerRef.current = setTimeout(() => {
        // If we accumulated a reasonable amount of characters, treat as scan
        if (hidBufferRef.current.length >= 3) {
          handleQrResult(hidBufferRef.current);
        }
        hidBufferRef.current = '';
      }, HID_MAX_CHAR_INTERVAL);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (hidTimerRef.current) clearTimeout(hidTimerRef.current);
      hidBufferRef.current = '';
    };
  }, [scanMode, handleQrResult]);

  // ── Camera scanner controls ──
  const startCamera = () => {
    setScanMode('camera');
    setResult(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );
      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScanMode('hid');
          handleQrResult(decodedText);
        },
        (err) => console.debug(err),
      );
      scannerRef.current = scanner;
    }, 100);
  };

  const stopCamera = () => {
    scannerRef.current?.clear();
    setScanMode('hid');
  };

  useEffect(() => () => { scannerRef.current?.clear(); }, []);

  // ── Auto-clear result after 8 seconds ──
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      setResult(null);
      setLastMeal(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [result]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🪪 Registro de Refeições</h1>
        <p className="page-subtitle">
          Utilize o leitor de código de barras ou a câmera para registrar consumos
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* ── Scan Mode Tabs ── */}
        <div className="scan-mode-tabs">
          <button
            className={`scan-mode-tab ${scanMode === 'hid' ? 'active' : ''}`}
            onClick={() => { stopCamera(); setScanMode('hid'); }}
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
            onClick={() => { stopCamera(); setScanMode('manual'); }}
          >
            <span className="scan-mode-tab-icon">⌨️</span>
            <span>Manual</span>
          </button>
        </div>

        {/* ── Result Feedback ── */}
        {result && (
          <div
            className={`scan-result-banner ${result.type === 'success' ? 'scan-result-success' : 'scan-result-error'}`}
          >
            <div className="scan-result-icon">
              {result.type === 'success' ? '✅' : '❌'}
            </div>
            <div className="scan-result-text">{result.msg}</div>
            {lastMeal && result.type === 'success' && (
              <>
                <div className="scan-result-detail" style={{ marginBottom: 12 }}>
                  {format(new Date(lastMeal.consumedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>

                {lastMeal.employee && (
                  <div style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(16, 185, 129, 0.2)',
                    width: '100%',
                    maxWidth: '450px',
                    textAlign: 'left'
                  }}>
                    <div style={{ marginBottom: 8, textAlign: 'center' }}>
                      <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Funcionário</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{lastMeal.employee.name}</span>
                      {lastMeal.employee.employeeCode && (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                          Matrícula: <strong>{lastMeal.employee.employeeCode}</strong>
                        </div>
                      )}
                    </div>

                    {lastMeal.allowance && (
                      <div className="grid-2" style={{ marginTop: 16, gap: 12 }}>
                        <div style={{ background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                          <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Consumido no Mês</span>
                          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                            {lastMeal.allowance.consumed} / {lastMeal.allowance.total}
                          </span>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                          <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(96, 165, 250, 0.8)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Saldo Disponível</span>
                          <span style={{ fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>
                            {lastMeal.allowance.remaining} refeições
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── HID Scanner Mode ── */}
        {scanMode === 'hid' && (
          <div className="card scan-hid-card">
            <div className="scan-hid-visual">
              <div className={`scan-hid-ring ${loading ? 'processing' : 'listening'}`}>
                <div className="scan-hid-ring-inner">
                  <span className="scan-hid-icon">{loading ? '⏳' : '🔌'}</span>
                </div>
              </div>
              <div className="scan-hid-status">
                {loading ? (
                  <>
                    <span className="scan-hid-status-label processing">Processando...</span>
                    <span className="scan-hid-status-sub">Registrando consumo no sistema</span>
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
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Ativo</span>
              </div>
              <p className="scan-hid-device-hint">
                Elgin Flash II / Bematech BR520 — Leitor USB (HID Keyboard Device).<br />
                Compatível com códigos de barras 1D (Code 128) e QR Code.
                <br />O leitor enviará os dados automaticamente ao escanear o crachá.
              </p>
            </div>

            {scanCount > 0 && (
              <div className="scan-hid-stats">
                <div className="scan-hid-stat">
                  <span className="scan-hid-stat-value">{scanCount}</span>
                  <span className="scan-hid-stat-label">Leituras nesta sessão</span>
                </div>
                {lastScanTime && (
                  <div className="scan-hid-stat">
                    <span className="scan-hid-stat-value">
                      {format(lastScanTime, 'HH:mm:ss')}
                    </span>
                    <span className="scan-hid-stat-label">Última leitura</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Camera Mode ── */}
        {scanMode === 'camera' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div id="qr-reader" />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
                Aponte a câmera para o código de barras do crachá
              </p>
              <button className="btn btn-danger" onClick={stopCamera}>
                ✕ Parar câmera
              </button>
            </div>
          </div>
        )}

        {/* ── Manual Mode ── */}
        {scanMode === 'manual' && (
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>🔢 Inserir token manualmente</h3>
            <div className="form-group">
              <label>Token do QR Code</label>
              <input
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Cole ou digite o token aqui..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualToken) handleQrResult(manualToken);
                }}
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { handleQrResult(manualToken); setManualToken(''); }}
              disabled={!manualToken || loading}
            >
              {loading ? 'Processando...' : '✅ Registrar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
