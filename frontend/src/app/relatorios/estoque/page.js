"use client";

import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import RelatoriosNav from "../../components/relatoriosNav/RelatoriosNav";
import styles from "../relatorios.module.css";

import apiService from "../../../services/api";
import { mapItemFromBackend } from "../../../services/dataMapper";

export default function RelatorioEstoque() {
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [totalEstoque, setTotalEstoque] = useState(0);

  // --- LÓGICA DE FILTROS ---
  const [filters, setFilters] = useState({ searchTerm: '', minQuantity: '', maxQuantity: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.searchTerm]);

  useEffect(() => {
    const activeFilters = {};
    if (debouncedSearch) activeFilters.searchTerm = debouncedSearch;
    if (filters.minQuantity) activeFilters.minQuantity = filters.minQuantity;
    if (filters.maxQuantity) activeFilters.maxQuantity = filters.maxQuantity;
    
    carregarDados(activeFilters);
  }, [debouncedSearch, filters.minQuantity, filters.maxQuantity]);
  // -------------------------

  async function carregarDados(activeFilters = {}) {
    try {
      setLoading(true);
      const response = await apiService.getItems(activeFilters);
      const itens = (response || []).map(mapItemFromBackend);
      setItems(itens);
      setTotalEstoque(
        itens.reduce((total, item) => total + (Number(item.quantidade) || 0), 0)
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const topItens = [...items]
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  const maiorQuantidade = Math.max(...topItens.map(i => i.quantidade), 1);

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />

      <div className={styles.pageContent}>
        
        {/* SEU CABEÇALHO E BOTÃO DE IMPRIMIR PERMANECEM INTACTOS AQUI */}
        <RelatoriosNav titulo="Relatório de Estoque" />

        {/* BARRA DE FILTROS (Inserida logo abaixo do título/botão) */}
        <div className={`${styles.filtersContainer} ${styles.hideOnPrint}`}>
          <div className={`${styles.formGroup} ${styles.filterGroupText}`}>
            <input 
              type="text" 
              placeholder="Filtrar por nome ou código..." 
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>
          <div className={`${styles.formGroup} ${styles.filterGroupNumber}`}>
            <input 
              type="number" 
              placeholder="Qtd Min." 
              min="0"
              value={filters.minQuantity}
              onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
            />
          </div>
          <div className={`${styles.formGroup} ${styles.filterGroupNumber}`}>
            <input 
              type="number" 
              placeholder="Qtd Máx." 
              min="0"
              value={filters.maxQuantity}
              onChange={(e) => setFilters(prev => ({ ...prev, maxQuantity: e.target.value }))}
            />
          </div>
          <button 
            className={styles.clearFilterButton} 
            onClick={() => {
              setFilters({ searchTerm: '', minQuantity: '', maxQuantity: '' });
              setDebouncedSearch('');
            }}
          >
            Limpar Filtros
          </button>
        </div>

        {/* Cards */}
        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>{loading ? "..." : totalEstoque}</span>
              <span className={styles.cardLabel}>Itens em Estoque</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>{loading ? "..." : items.length}</span>
              <span className={styles.cardLabel}>Produtos Cadastrados</span>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Top 10 Produtos em Estoque</h3>
          <p className={styles.chartSub}>Produtos com maior quantidade disponível</p>
          {loading ? (
            <div className={styles.chartLoading}>Carregando...</div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {topItens.map(item => (
                <div key={item.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.9rem" }}>
                    <span>{item.nome}</span>
                    <strong>{item.quantidade}</strong>
                  </div>
                  <div style={{ height: 18, background: "#ECEFF1", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(item.quantidade / maiorQuantidade) * 100}%`, background: "#4CAF50" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className={styles.chartBox} style={{ marginTop: 20 }}>
          <h3 className={styles.chartTitle}>Produtos Cadastrados</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 15 }}>
            <thead>
              <tr>
                <th align="left">Produto</th>
                <th align="left">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}