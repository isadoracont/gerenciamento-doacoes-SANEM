"use client";
import { useState, useEffect } from 'react';
import apiService from '../../services/api';

export default function LimitInfoDisplay({ beneficiaryId }) {
  const [limitInfo, setLimitInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (beneficiaryId) {
      loadLimitInfo();
    }
  }, [beneficiaryId]);

  const loadLimitInfo = async () => {
    try {
      setLoading(true);
      const info = await apiService.getWithdrawalLimitInfo(beneficiaryId);
      setLimitInfo(info);
    } catch (err) {
      console.error("Erro ao carregar informações de limite:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!beneficiaryId) {
    return null;
  }

  if (loading) {
    return <div style={{ padding: '10px', color: '#666' }}>Carregando informações de limite...</div>;
  }

  if (!limitInfo) {
    return null;
  }

  const percentage = (limitInfo.itemsWithdrawnThisMonth / limitInfo.monthlyLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div style={{
      background: isAtLimit ? '#ffebee' : isNearLimit ? '#fff3e0' : '#e8f5e9',
      border: `2px solid ${isAtLimit ? '#f44336' : isNearLimit ? '#ff9800' : '#4CAF50'}`,
      borderRadius: '8px',
      padding: '15px',
      margin: '15px 0'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#333' }}>
        Limite Mensal de Retirada
      </h3>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#666' }}>Itens retirados este mês:</span>
          <strong style={{ color: isAtLimit ? '#f44336' : isNearLimit ? '#ff9800' : '#4CAF50' }}>
            {limitInfo.itemsWithdrawnThisMonth} / {limitInfo.monthlyLimit}
          </strong>
        </div>
        <div style={{
          width: '100%',
          height: '20px',
          background: '#e0e0e0',
          borderRadius: '10px',
          overflow: 'hidden',
          marginTop: '5px'
        }}>
          <div style={{
            width: `${Math.min(100, percentage)}%`,
            height: '100%',
            background: isAtLimit ? '#f44336' : isNearLimit ? '#ff9800' : '#4CAF50',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#666' }}>
        {isAtLimit ? (
          <span style={{ color: '#f44336', fontWeight: '600' }}>
            Limite mensal atingido. Não é possível retirar mais itens este mês.
          </span>
        ) : (
          <span>
            Itens restantes: <strong>{limitInfo.remainingItems}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

