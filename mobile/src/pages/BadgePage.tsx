import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface QrData {
  userId: string;
  qrCodeToken: string;
  qrDataUrl: string;
  userName: string;
  employeeCode: string;
  tenantName: string;
}

export default function BadgePage() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQr = async () => {
      if (!user?.id) return;
      try {
        const { data } = await api.get(`/users/${user.id}/qrcode`);
        setQrData(data);
      } catch (err: any) {
        console.error('Erro ao buscar QR Code:', err);
        setError(err.response?.data?.message || 'Erro ao carregar QR Code');
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
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

  if (error || !qrData) {
    return (
      <div className="scroll-view">
        <div className="badge-container">
          <div className="badge-error">
            <span style={{ fontSize: 48 }}>⚠️</span>
            <p>{error || 'Não foi possível carregar o QR Code'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-view">
      <div className="badge-container">
        <div className="badge-header">
          <h2 className="badge-title">Seu Crachá</h2>
          <p className="badge-subtitle">Apresente este QR Code na catraca do refeitório</p>
        </div>

        <div className="badge-card">
          <div className="badge-qr-wrapper">
            <img
              src={qrData.qrDataUrl}
              alt="QR Code"
              className="badge-qr"
            />
          </div>

          <div className="badge-info">
            <div className="badge-name">{qrData.userName}</div>
            {qrData.employeeCode && (
              <div className="badge-code">Código: {qrData.employeeCode}</div>
            )}
            {qrData.tenantName && (
              <div className="badge-tenant">{qrData.tenantName}</div>
            )}
          </div>
        </div>

        <div className="badge-footer">
          <p className="badge-hint">
            📱 Este é o seu QR Code pessoal.<br />
            Mantenha-o disponível para escanear na entrada do refeitório.
          </p>
        </div>
      </div>
    </div>
  );
}
