import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

interface ScanFiscalPageProps {
  onBack: () => void;
}

type ResultState =
  | null
  | { type: 'success'; employeeName: string; mealName: string; restaurant: string; time: string }
  | { type: 'error'; message: string };

const MEAL_META: Record<string, { icon: string }> = {
  'cafe-manha':   { icon: '☕' },
  'almoco':       { icon: '🍽️' },
  'lanche-tarde': { icon: '🥪' },
  'jantar':       { icon: '🌙' },
  'lanche-noite': { icon: '🌃' },
};

export default function ScanFiscalPage({ onBack }: ScanFiscalPageProps) {
  const [result, setResult] = useState<ResultState>(null);
  const [scanning, setScanning] = useState(true);
  const [manualToken, setManualToken] = useState('');
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    startScanner();
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch {}
  };

  const startScanner = async () => {
    await stopScanner();
    setScanning(true);

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (processing || !mountedRef.current) return;
          setProcessing(true);
          await stopScanner();
          setScanning(false);
          await handleQrResult(decodedText);
          setProcessing(false);
        },
        () => {},
      );
    } catch (err) {
      console.error('Camera error:', err);
      setScanning(false);
    }
  };

  const handleQrResult = async (raw: string) => {
    try {
      let userId = raw;
      try {
        const parsed = JSON.parse(raw);
        userId = parsed.userId || raw;
      } catch {}

      const { data } = await api.post('/consumptions/scan', { userId });
      if (mountedRef.current) {
        setResult({
          type: 'success',
          employeeName: data.employee?.name || data.user?.name || 'Funcionário',
          mealName: data.mealType?.name || 'Refeição',
          restaurant: data.restaurant?.name || '',
          time: new Date(data.consumedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setResult({
          type: 'error',
          message: err.response?.data?.message || 'Erro ao registrar consumo. Tente novamente.',
        });
      }
    }
  };

  const reset = async () => {
    setResult(null);
    setManualToken('');
    await startScanner();
  };

  const handleManual = async () => {
    if (!manualToken.trim() || processing) return;
    setProcessing(true);
    await stopScanner();
    setScanning(false);
    await handleQrResult(manualToken.trim());
    setProcessing(false);
  };

  return (
    <div className="scan-page">
      <div className="scan-header">
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', font: 'inherit', fontSize: 14, cursor: 'pointer', marginBottom: 8 }}
        >
          ← Voltar
        </button>
        <h2 className="scan-title">Escanear Crachá</h2>
        <p className="scan-subtitle">Aponte a câmera para o QR Code do crachá do funcionário</p>
      </div>

      <div className="scan-viewport">
        <div id="qr-reader" style={{ width: '100%', height: '100%' }} />

        {scanning && (
          <div className="scan-overlay">
            <div className="scan-frame">
              <div className="scan-corner scan-corner-tl" />
              <div className="scan-corner scan-corner-tr" />
              <div className="scan-corner scan-corner-bl" />
              <div className="scan-corner scan-corner-br" />
              <div className="scan-line" />
            </div>
          </div>
        )}

        {processing && (
          <div className="scan-overlay" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', flexDirection: 'column', gap: 12 }}>
            <div className="spinner" />
            <span style={{ color: 'white', fontSize: 14 }}>Registrando...</span>
          </div>
        )}

        {!scanning && !processing && !result && (
          <div className="scan-overlay" style={{ flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 48 }}>📷</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Câmera não disponível</span>
          </div>
        )}
      </div>

      <div className="scan-bottom">
        <div className="scan-or">ou insira o ID do crachá manualmente</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input-field"
            style={{ flex: 1, fontSize: 13, padding: '12px 14px' }}
            placeholder="ID do crachá"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
          <button
            onClick={handleManual}
            disabled={!manualToken.trim() || processing}
            style={{
              background: 'var(--primary)', color: 'white', border: 'none',
              borderRadius: 'var(--r-md)', padding: '0 18px', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', flexShrink: 0, opacity: !manualToken.trim() ? 0.5 : 1,
            }}
          >
            OK
          </button>
        </div>
      </div>

      {/* Result Sheet */}
      {result && (
        <div className="result-sheet" onClick={() => result.type === 'error' && reset()}>
          <div className="result-card" onClick={(e) => e.stopPropagation()}>
            {result.type === 'success' ? (
              <>
                <div className="result-icon">✅</div>
                <div className="result-title-success">Refeição autorizada!</div>

                <div className="result-meal-chip">
                  <span>{MEAL_META[Object.keys(MEAL_META).find(k => result.mealName?.toLowerCase().includes(k.replace(/-/g,' '))) || '']?.icon || '🍴'}</span>
                  {result.mealName}
                </div>

                <div className="result-message">
                  <strong>{result.employeeName}</strong><br />
                  {result.restaurant && <>{result.restaurant}<br /></>}
                  Registrado às {result.time}
                </div>

                <button className="result-btn result-btn-success" onClick={onBack}>
                  Concluir
                </button>
                <button
                  onClick={reset}
                  style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
                >
                  Escanear outro
                </button>
              </>
            ) : (
              <>
                <div className="result-icon">❌</div>
                <div className="result-title-error">Ops! Algo deu errado</div>
                <div className="result-message">{result.message}</div>
                <button className="result-btn result-btn-error" onClick={reset}>
                  Tentar novamente
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
