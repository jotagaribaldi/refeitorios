import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface BarcodeData {
  userId: string;
  barcodeToken: string;
  userName: string;
  employeeCode: string;
  tenantName: string;
}

// Renderiza o código de barras Code128 num SVG
function BarcodeSvg({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        width: 2.2,
        height: 90,
        displayValue: false,
        margin: 12,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch (e) {
      console.error('Erro ao gerar código de barras:', e);
    }
  }, [value]);

  return <svg ref={svgRef} style={{ width: '100%', maxWidth: 320 }} />;
}

export default function BadgePage() {
  const { user } = useAuth();
  const [barcodeData, setBarcodeData] = useState<BarcodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarcode = async () => {
      if (!user?.id) return;
      try {
        // Usa o alias /qrcode que agora retorna dados de barcode
        const { data } = await api.get(`/users/${user.id}/qrcode`);
        setBarcodeData(data);
      } catch (err: any) {
        console.error('Erro ao buscar crachá:', err);
        setError(err.response?.data?.message || 'Erro ao carregar o crachá');
      } finally {
        setLoading(false);
      }
    };
    fetchBarcode();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="scroll-view">
        <div className="badge-container">
          <div className="badge-loading">
            <div className="spinner" />
            <span>Carregando seu crachá...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !barcodeData) {
    return (
      <div className="scroll-view">
        <div className="badge-container">
          <div className="badge-error">
            <span style={{ fontSize: 48 }}>⚠️</span>
            <p>{error || 'Não foi possível carregar o crachá'}</p>
          </div>
        </div>
      </div>
    );
  }

  const token = barcodeData.barcodeToken;

  return (
    <div className="scroll-view">
      <div className="badge-container">
        <div className="badge-header">
          <h2 className="badge-title">Seu Crachá</h2>
          <p className="badge-subtitle">Apresente este crachá na entrada do refeitório</p>
        </div>

        <div className="badge-card">
          <div className="badge-qr-wrapper" style={{ padding: '16px 8px 8px' }}>
            {token ? (
              <BarcodeSvg value={token} />
            ) : (
              <p style={{ color: '#999', fontSize: 13 }}>Código indisponível</p>
            )}
          </div>

          <div className="badge-info">
            <div className="badge-name">{barcodeData.userName}</div>
            {barcodeData.employeeCode && (
              <div className="badge-code">Código: {barcodeData.employeeCode}</div>
            )}
            {barcodeData.tenantName && (
              <div className="badge-tenant">{barcodeData.tenantName}</div>
            )}
          </div>
        </div>

        <div className="badge-footer">
          <p className="badge-hint">
            🪪 Este é o seu código de barras pessoal.<br />
            Mantenha-o disponível para leitura na entrada do refeitório.<br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>Compatível com leitores 1D e 2D.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
