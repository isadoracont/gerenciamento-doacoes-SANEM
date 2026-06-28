"use client";

import React, { useEffect, useState, useRef } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import RelatoriosNav from "../../components/relatoriosNav/RelatoriosNav";
import styles from "../relatorios.module.css";
import { FaChevronDown, FaTimes } from 'react-icons/fa';

import apiService from "../../../services/api";

export default function RelatorioRetiradas() {
  const [loading, setLoading] = useState(true);

  const [withdrawals, setWithdrawals] = useState([]);
  const [totalItens, setTotalItens] = useState(0);
  const [totalRetiradas, setTotalRetiradas] = useState(0);
  const [totalBeneficiarios, setTotalBeneficiarios] = useState(0);

  // --- LÓGICA DE FILTROS ---
  const [filters, setFilters] = useState({ startDate: "", endDate: "", beneficiaryName: "", itemName: "" });
  const [inputValues, setInputValues] = useState({ beneficiaryName: "", itemName: "" });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ beneficiaries: [], items: [] });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setInputValues({ beneficiaryName: filters.beneficiaryName, itemName: filters.itemName });
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filters]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [bData, iData] = await Promise.all([apiService.getBeneficiaries(), apiService.getItems()]);
        setFilterOptions({
          beneficiaries: (bData || []).map(b => b.fullName || b.nomeCompleto).filter(Boolean),
          items: (iData || []).map(i => i.description || i.nome).filter(Boolean)
        });
      } catch (err) {
        console.error("Erro ao carregar opções", err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    carregarDados(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.beneficiaryName, filters.itemName]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTextTyping = (field, value) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    setActiveDropdown(field);
    if (value.trim() === "") setFilters(prev => ({ ...prev, [field]: "" }));
  };

  const handleOptionSelect = (field, value) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    setFilters(prev => ({ ...prev, [field]: value }));
    setActiveDropdown(null);
  };
  // -------------------------

  async function carregarDados(activeFilters = {}) {
    if (activeFilters.startDate && activeFilters.endDate) {
        if (new Date(activeFilters.startDate) > new Date(activeFilters.endDate)) {
            alert("A data inicial não pode ser maior que a data final.");
            return;
        }
    }

    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(Object.entries(activeFilters).filter(([_, v]) => v !== ""));
      const data = await apiService.getWithdrawals(cleanFilters);
      const lista = Array.isArray(data) ? data : [];
      setWithdrawals(lista);

      const itensRetirados = lista.reduce((total, retirada) =>
          total + (retirada.items || []).reduce((soma, item) => soma + (item.quantity || 0), 0), 0
      );
      const beneficiariosUnicos = new Set(lista.map(r => r.beneficiary?.beneficiaryId)).size;

      setTotalItens(itensRetirados);
      setTotalRetiradas(lista.length);
      setTotalBeneficiarios(beneficiariosUnicos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  const ranking = {};
  withdrawals.forEach(retirada => {
    const nome = retirada.beneficiary?.fullName || "Beneficiário";
    const quantidade = (retirada.items || []).reduce((soma, item) => soma + (item.quantity || 0), 0);
    ranking[nome] = (ranking[nome] || 0) + quantidade;
  });

  const topBeneficiarios = Object.entries(ranking).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total).slice(0, 10);
  const maiorValor = Math.max(...topBeneficiarios.map(b => b.total), 1);

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />

      <div className={styles.pageContent}>
        
        {/* SEU CABEÇALHO E BOTÃO DE IMPRIMIR PERMANECEM INTACTOS AQUI */}
        <RelatoriosNav titulo="Relatório de Retiradas" />

        {/* BARRA DE FILTROS */}
        <div className={`${styles.filtersContainer} ${styles.hideOnPrint}`} ref={dropdownRef}>
          <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleDateChange} title="Data Inicial" />
          </div>
          <span className={styles.dateSeparator}>até</span>
          <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleDateChange} title="Data Final" />
          </div>

          <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
            <input 
              type="text" placeholder="Filtrar por Beneficiário..." 
              value={inputValues.beneficiaryName} onChange={(e) => handleTextTyping("beneficiaryName", e.target.value)}
              onClick={() => setActiveDropdown("beneficiaryName")} autoComplete="off" style={{ paddingRight: "60px" }}
            />
            {inputValues.beneficiaryName && (
              <FaTimes className={styles.clearIcon} onClick={(e) => { e.stopPropagation(); handleOptionSelect("beneficiaryName", ""); }} title="Limpar" />
            )}
            <FaChevronDown className={styles.selectIcon} style={{ transform: activeDropdown === "beneficiaryName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }} />
            {activeDropdown === "beneficiaryName" && (
              <div className={styles.filterDropdown}>
                {filterOptions.beneficiaries.filter(opt => opt.toLowerCase().includes(inputValues.beneficiaryName.toLowerCase())).map((opt, idx) => (
                  <div key={idx} className={styles.filterDropdownItem} onClick={() => handleOptionSelect("beneficiaryName", opt)}>{opt}</div>
                ))}
              </div>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
            <input 
              type="text" placeholder="Filtrar por Item..." 
              value={inputValues.itemName} onChange={(e) => handleTextTyping("itemName", e.target.value)}
              onClick={() => setActiveDropdown("itemName")} autoComplete="off" style={{ paddingRight: "60px" }}
            />
            {inputValues.itemName && (
              <FaTimes className={styles.clearIcon} onClick={(e) => { e.stopPropagation(); handleOptionSelect("itemName", ""); }} title="Limpar" />
            )}
            <FaChevronDown className={styles.selectIcon} style={{ transform: activeDropdown === "itemName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }} />
            {activeDropdown === "itemName" && (
              <div className={styles.filterDropdown}>
                {filterOptions.items.filter(opt => opt.toLowerCase().includes(inputValues.itemName.toLowerCase())).map((opt, idx) => (
                  <div key={idx} className={styles.filterDropdownItem} onClick={() => handleOptionSelect("itemName", opt)}>{opt}</div>
                ))}
              </div>
            )}
          </div>

          <button className={styles.clearFilterButton} onClick={() => {
            setFilters({ startDate: "", endDate: "", beneficiaryName: "", itemName: "" });
            setInputValues({ beneficiaryName: "", itemName: "" });
          }}>
            Limpar Filtros
          </button>
        </div>

        {/* Cards */}
        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>{loading ? "..." : totalRetiradas}</span>
              <span className={styles.cardLabel}>Retiradas Registradas</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>{loading ? "..." : totalItens}</span>
              <span className={styles.cardLabel}>Itens Retirados</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>{loading ? "..." : totalBeneficiarios}</span>
              <span className={styles.cardLabel}>Beneficiários Atendidos</span>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Beneficiários com Mais Retiradas</h3>
          <p className={styles.chartSub}>Quantidade total de itens retirados</p>
          {loading ? (
            <div className={styles.chartLoading}>Carregando...</div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {topBeneficiarios.map(beneficiario => (
                <div key={beneficiario.nome} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span>{beneficiario.nome}</span>
                    <strong>{beneficiario.total}</strong>
                  </div>
                  <div style={{ height: 18, background: "#ECEFF1", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(beneficiario.total / maiorValor) * 100}%`, background: "#4CAF50" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico */}
        <div className={styles.chartBox} style={{ marginTop: 20 }}>
          <h3 className={styles.chartTitle}>Histórico de Retiradas</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 15 }}>
            <thead>
              <tr>
                <th align="left">Data</th>
                <th align="left">Beneficiário</th>
                <th align="left">Itens</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(retirada => (
                <tr key={retirada.withdrawalId}>
                  <td>{formatarData(retirada.withdrawalDate)}</td>
                  <td>{retirada.beneficiary?.fullName}</td>
                  <td>
                    {(retirada.items || []).map(item => `${item.itemDTO?.description} (${item.quantity})`).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}