"use client";
import { useState, useEffect } from 'react';
import Navigation from '../components/navegation/navegation';
import MenuBar from '../components/menubar/menubar';
import apiService from '../../services/api';
import { useNotification } from '../../components/notifications/NotificationProvider';
import { useApi } from '../../hooks/useApi';
import styles from './configuracoes.module.css';

export default function ConfiguracoesPage() {
  const { showNotification } = useNotification();
  const { loading, execute } = useApi();
  const [config, setConfig] = useState({
    monthlyItemLimit: 10,
    isActive: true
  });
  const [configId, setConfigId] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const data = await apiService.getWithdrawalLimitConfig();
      setConfig({
        monthlyItemLimit: data.monthlyItemLimit,
        isActive: data.isActive
      });
      setConfigId(data.configId);
    } catch (err) {
      console.error("Erro ao carregar configuração:", err);
      showNotification("Erro ao carregar configuração", "error");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!configId) {
      showNotification("Configuração não encontrada", "error");
      return;
    }

    try {
      await execute(() => apiService.updateWithdrawalLimitConfig(configId, config));
      showNotification("Configuração atualizada com sucesso!", "success");
    } catch (err) {
      showNotification(err.message || "Erro ao atualizar configuração", "error");
    }
  };

  return (
    <div className={styles.containerGeral}>
      <Navigation />
      <MenuBar />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>Configurações</h1>
          <div className={styles.decoracao}></div>

          <div className={styles.configSection}>
            <h2 className={styles.sectionTitle}>Limites de Retirada</h2>
            <p className={styles.sectionDescription}>
              Configure o limite mensal de itens que cada beneficiário pode retirar.
            </p>

            {loadingConfig ? (
              <div className={styles.loadingMessage}>Carregando...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="monthlyItemLimit">Limite Mensal de Itens</label>
                  <input
                    id="monthlyItemLimit"
                    type="number"
                    min="1"
                    value={config.monthlyItemLimit}
                    onChange={(e) => setConfig({ ...config, monthlyItemLimit: parseInt(e.target.value) || 1 })}
                    required
                  />
                  <small>
                    Número máximo de itens que um beneficiário pode retirar por mês.
                  </small>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={config.isActive}
                    onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive">Ativar limite de retirada</label>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Configuração'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 