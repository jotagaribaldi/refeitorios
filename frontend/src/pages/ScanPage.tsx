import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [lastMeal, setLastMeal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const startScanner = () => {
    setScanning(true);
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
          setScanning(false);
          handleQrResult(decodedText);
        },
        (err) => console.debug(err),
      );
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    scannerRef.current?.clear();
    setScanning(false);
  };

  const handleQrResult = async (raw: string) => {
    setLoading(true);
    setResult(null);
    try {
      let token = raw;
      try {
        const parsed = JSON.parse(raw);
        token = parsed.token;
      } catch {}

      const { data } = await api.post('/consumptions', { qrCodeToken: token });
      setLastMeal(data);
      setResult({ type: 'success', msg: 'Refeição registrada com sucesso! ✅' });
    } catch (err: any) {
      setResult({ type: 'error', msg: err.response?.data?.message || 'Erro ao registrar consumo' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => { scannerRef.current?.clear(); }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📲 Escanear QR Code</h1>
        <p className="page-subtitle">Aponte a câmera para o QR Code do refeitório</p>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.msg}
          </div>
        )}

        {lastMeal && (
          <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div className="fw-700" style={{ fontSize: 18, marginBottom: 4 }}>
              Consumo Registrado
            </div>
            <div className="text-muted text-sm">
              {format(new Date(lastMeal.consumedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        )}

        {!scanning && (
          <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>📷</div>
            <p className="text-muted" style={{ marginBottom: 20 }}>
              Clique no botão abaixo para iniciar a câmera e escanear o QR Code do refeitório.
            </p>
            <button className="btn btn-primary btn-lg" onClick={startScanner} disabled={loading}>
              {loading ? 'Processando...' : '📷 Iniciar Scanner'}
            </button>
          </div>
        )}

        {scanning && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div id="qr-reader" />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="btn btn-danger" onClick={stopScanner}>✕ Parar</button>
            </div>
          </div>
        )}

        {/* Manual input fallback */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 12 }}>🔢 Inserir token manualmente</h3>
          <div className="form-group">
            <label>Token do QR Code</label>
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Cole o token aqui..."
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => handleQrResult(manualToken)}
            disabled={!manualToken || loading}
          >
            ✅ Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
