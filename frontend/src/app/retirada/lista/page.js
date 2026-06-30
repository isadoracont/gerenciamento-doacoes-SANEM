"use client";
import React, { useState, useEffect, useRef } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import { useRouter } from "next/navigation";
import styles from "./lista.module.css";
import apiService from "../../../services/api";
import { useNotification } from "../../../components/notifications/NotificationProvider";
import { FaPlus, FaTrash, FaMinus, FaChevronDown, FaTimes } from "react-icons/fa";
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal";
import { mapBeneficiaryFromBackend, mapItemFromBackend } from "../../../services/dataMapper";
import authService from "../../../services/authService";

export default function ListaRetiradasPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: "", title: "" });

  // Modais e estados de Adição
  const [showAddModal, setShowAddModal] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchBeneficiary, setSearchBeneficiary] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [limitInfoStatus, setLimitInfoStatus] = useState("idle");

  const currentUser = authService.getUser();

  const isAdmin = currentUser?.role?.toUpperCase() === "ADMINISTRATOR";

  // ==========================================
  // LÓGICA DE FILTROS APRIMORADA
  // ==========================================

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    beneficiaryName: "",
    attendantName: "",
    itemName: ""
  });

  const [inputValues, setInputValues] = useState({
    beneficiaryName: "",
    attendantName: "",
    itemName: ""
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    beneficiaries: [],
    attendants: [],
    items: []
  });

  const dropdownRef = useRef(null);

  // Detecta cliques fora dos dropdowns para fechá-los
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setInputValues({
          beneficiaryName: filters.beneficiaryName,
          attendantName: filters.attendantName,
          itemName: filters.itemName
        });
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filters]);

  // Carrega as opções dos selects de filtro ao montar a tela
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [bData, uData, iData] = await Promise.all([
          apiService.getBeneficiaries(),
          apiService.getUsers(),
          apiService.getItems()
        ]);
        setFilterOptions({
          beneficiaries: (bData || []).map(b => b.fullName || b.nomeCompleto).filter(Boolean),
          attendants: (uData || []).map(u => u.name || u.nomeCompleto).filter(Boolean),
          items: (iData || []).map(i => i.description || i.nome).filter(Boolean)
        });
      } catch (err) {
        console.error("Erro ao carregar opções de filtro", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Carrega os dados reais sempre que o objeto de filtros oficiais mudar
  useEffect(() => {
    loadWithdrawals(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.beneficiaryName, filters.attendantName, filters.itemName]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTextTyping = (field, value) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    setActiveDropdown(field);
    if (value.trim() === "") {
      setFilters(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleOptionSelect = (field, value) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    setFilters(prev => ({ ...prev, [field]: value }));
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", beneficiaryName: "", attendantName: "", itemName: "" });
    setInputValues({ beneficiaryName: "", attendantName: "", itemName: "" });
  };

  const loadWithdrawals = async (activeFilters = {}) => {
    if (activeFilters.startDate && activeFilters.endDate) {
      if (new Date(activeFilters.startDate) > new Date(activeFilters.endDate)) {
        showNotification("A data inicial não pode ser maior que a data final.", "warning");
        setWithdrawals([]);
        return;
      }
    }

    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([_, v]) => v !== "")
      );

      const data = await apiService.getWithdrawals(cleanFilters);
      const withdrawalsArray = Array.isArray(data) ? data : [];

      const sortedWithdrawals = withdrawalsArray.sort((a, b) => {
        const dateA = a.withdrawalDate ? new Date(a.withdrawalDate).getTime() : 0;
        const dateB = b.withdrawalDate ? new Date(b.withdrawalDate).getTime() : 0;
        return dateB - dateA;
      });

      setWithdrawals(sortedWithdrawals);
    } catch (err) {
      console.error("Erro ao carregar retiradas:", err);
      showNotification(err.message || "Erro ao carregar retiradas", "error");
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };
  // ==========================================

  useEffect(() => {
    if (showAddModal) {
      loadBeneficiaries();
      loadItems();
    }
  }, [showAddModal]);

  useEffect(() => {
    if (selectedBeneficiary) {
      loadLimitInfo(selectedBeneficiary.id);
    }
  }, [selectedBeneficiary]);

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        try {
          await apiService.deleteWithdrawal(id);
          showNotification("Retirada excluída com sucesso!", "success");
          loadWithdrawals(filters); // Atualiza mantendo os filtros
        } catch (err) {
          console.error("Erro ao excluir retirada:", err);
          showNotification(err.message || "Erro ao excluir retirada", "error");
        } finally {
          setConfirmModal({ isOpen: false, action: null, message: "", title: "" });
        }
      },
      message: "Tem certeza que deseja excluir esta retirada? Esta ação não pode ser desfeita.",
      title: "Confirmar Exclusão"
    });
  };

  const loadBeneficiaries = async () => {
    try {
      const data = await apiService.getBeneficiaries();
      const mapped = (data || []).map(mapBeneficiaryFromBackend);
      setBeneficiaries(mapped);
    } catch (err) {
      showNotification("Erro ao carregar beneficiários", "error");
    }
  };

  const loadItems = async () => {
    try {
      const data = await apiService.getItems();
      const mapped = (data || []).map(mapItemFromBackend).filter(item => item.quantidade > 0);
      setItems(mapped);
    } catch (err) {
      showNotification("Erro ao carregar itens", "error");
    }
  };

  const loadLimitInfo = async (beneficiaryId) => {
    try {
      setLimitInfo(null);
      setLimitInfoStatus("loading");
      const info = await apiService.getWithdrawalLimitInfo(beneficiaryId);
      setLimitInfo(info);
      setLimitInfoStatus("loaded");
    } catch (err) {
      console.error("Erro ao carregar informações de limite:", err);
      setLimitInfo(null);
      setLimitInfoStatus("error");
    }
  };

  const handleAdd = () => {
    setSelectedBeneficiary(null);
    setSelectedItems([]);
    setSearchBeneficiary("");
    setSearchItem("");
    setLimitInfo(null);
    setLimitInfoStatus("idle");
    setShowAddModal(true);
  };

  const filteredBeneficiaries = beneficiaries.filter(b =>
    b.nomeCompleto?.toLowerCase().includes(searchBeneficiary.toLowerCase()) ||
    b.cpfCrnm?.includes(searchBeneficiary)
  );

  const filteredItems = items.filter(item =>
    item.nome?.toLowerCase().includes(searchItem.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(searchItem.toLowerCase())
  );

  const handleAddItem = (item) => {
    const existing = selectedItems.find(si => si.itemId === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(si =>
        si.itemId === item.id
          ? { ...si, quantity: Math.min(si.quantity + 1, item.quantidade) }
          : si
      ));
    } else {
      setSelectedItems([...selectedItems, { itemId: item.id, quantity: 1, item }]);
    }
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setSelectedItems(selectedItems.map(si => {
      if (si.itemId === itemId) {
        const item = items.find(i => i.id === itemId);
        const newQuantity = Math.max(1, Math.min(si.quantity + delta, item?.quantidade || si.quantity));
        return { ...si, quantity: newQuantity };
      }
      return si;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(si => si.itemId !== itemId));
  };

  const handleResetLimit = async () => {
    if (!selectedBeneficiary) {
      showNotification(
        "Selecione um beneficiário antes de resetar o limite",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente zerar o limite mensal de ${selectedBeneficiary.nomeCompleto}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);

      await apiService.resetWithdrawalLimit(selectedBeneficiary.id);
      await loadLimitInfo(selectedBeneficiary.id);

      showNotification("Limite mensal zerado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao resetar limite:", err);

      showNotification(
        err.message || "Erro ao resetar limite mensal",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();

    if (!selectedBeneficiary) {
      showNotification("Selecione um beneficiário", "error");
      return;
    }

    if (selectedItems.length === 0) {
      showNotification("Adicione pelo menos um item", "error");
      return;
    }

    const user = authService.getUser();
    if (!user || !user.id) {
      showNotification("Usuário não autenticado. Por favor, faça login novamente.", "error");
      return;
    }

    const invalidItems = selectedItems.filter(si => !si.itemId || !si.quantity || si.quantity <= 0);
    if (invalidItems.length > 0) {
      showNotification("Alguns itens possuem quantidade inválida", "error");
      return;
    }

    const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0);
    if (limitInfo && limitInfo.remainingItems !== null && limitInfo.remainingItems < totalItems) {
      const confirmMessage = `O total de itens selecionados (${totalItems}) excede o limite restante (${limitInfo.remainingItems}). Deseja continuar mesmo assim?`;
      if (!window.confirm(confirmMessage)) return;
    }

    if (isLimitBeingChecked) {
      showNotification(
        "Aguarde a verificação do limite mensal do beneficiário.", "error"
      );
      return;
    }

    if (beneficiaryHasNoLimit) {
      showNotification(
        "Este beneficiário não possui limite mensal configurado. Não é possível registrar a retirada.", "error"
      );
      return;
    }

    if (failedToLoadLimit) {
      showNotification(
        "Não foi possível verificar o limite mensal. Tente novamente.", "error"
      );
      return;
    }

    if (exceedsRemainingLimit) {
      showNotification(
        `Não é possível registrar a retirada. Foram selecionados ${totalItems} item(ns), mas o beneficiário possui apenas ${limitInfo?.remainingItems ?? 0} item(ns) restantes no limite mensal.`, "error"
      );
      return;
    }

    try {
      setSubmitting(true);
      const withdrawalData = {
        withdrawalDate: new Date().toISOString(),
        beneficiaryId: selectedBeneficiary.id,
        attendantUserId: user.id,
        items: selectedItems.map(si => ({
          itemId: si.itemId,
          quantity: si.quantity
        }))
      };

      await apiService.createWithdrawal(withdrawalData);
      showNotification("Retirada registrada com sucesso!", "success");
      setShowAddModal(false);
      setSelectedBeneficiary(null);
      setSelectedItems([]);
      setSearchBeneficiary("");
      setSearchItem("");
      setLimitInfo(null);
      loadWithdrawals(filters);
    } catch (err) {
      showNotification(err.message || "Erro ao registrar retirada", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0);

  const hasMonthlyLimitConfigured =
    limitInfo?.monthlyLimit !== null &&
    limitInfo?.monthlyLimit !== undefined &&
    limitInfo?.monthlyLimit !== "";

  const monthlyLimit = Number(limitInfo?.monthlyLimit ?? 0);

  const beneficiaryHasNoLimit =
    limitInfoStatus === "loaded" &&
    (!hasMonthlyLimitConfigured || monthlyLimit <= 0);

  const isLimitBeingChecked =
    selectedBeneficiary !== null &&
    limitInfoStatus === "loading";

  const failedToLoadLimit =
    selectedBeneficiary !== null &&
    limitInfoStatus === "error";

  const exceedsRemainingLimit =
    limitInfoStatus === "loaded" &&
    limitInfo?.remainingItems !== null &&
    Number(limitInfo.remainingItems) < totalItems;

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>

          <div className={styles.pageHeader}>
            <h1 className={styles.titulo}>Retiradas Registradas</h1>
            <button className={styles.addButton} onClick={handleAdd} title="Registrar Nova Retirada">
              <FaPlus />
            </button>
          </div>
          <div className={styles.decoracao}></div>

          {/* BARRA DE FILTROS ENVOLVIDA PELA REF */}
          <div className={styles.filtersContainer} ref={dropdownRef}>
            <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleDateChange}
                title="Data Inicial"
              />
            </div>
            <span className={styles.dateSeparator}>até</span>
            <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleDateChange}
                title="Data Final"
              />
            </div>

            {/* SELECT COM PESQUISA: Beneficiário */}
            <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Filtrar por Beneficiário..."
                value={inputValues.beneficiaryName}
                onChange={(e) => handleTextTyping("beneficiaryName", e.target.value)}
                onClick={() => setActiveDropdown("beneficiaryName")}
                autoComplete="off"
                style={{ paddingRight: "60px" }}
              />
              {inputValues.beneficiaryName && (
                <FaTimes
                  className={styles.clearIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect("beneficiaryName", "");
                  }}
                  title="Limpar Beneficiário"
                />
              )}
              <FaChevronDown
                className={styles.selectIcon}
                style={{ transform: activeDropdown === "beneficiaryName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
              />
              {activeDropdown === "beneficiaryName" && (
                <div className={styles.filterDropdown}>
                  {filterOptions.beneficiaries
                    .filter(opt => opt.toLowerCase().includes(inputValues.beneficiaryName.toLowerCase()))
                    .map((opt, idx) => (
                      <div
                        key={idx}
                        className={styles.filterDropdownItem}
                        onClick={() => handleOptionSelect("beneficiaryName", opt)}
                      >
                        {opt}
                      </div>
                    ))}
                  {filterOptions.beneficiaries.filter(opt => opt.toLowerCase().includes(inputValues.beneficiaryName.toLowerCase())).length === 0 && (
                    <div className={styles.filterDropdownItemEmpty}>Nenhum beneficiário encontrado</div>
                  )}
                </div>
              )}
            </div>

            {/* SELECT COM PESQUISA: Atendente */}
            <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Filtrar por Atendente..."
                value={inputValues.attendantName}
                onChange={(e) => handleTextTyping("attendantName", e.target.value)}
                onClick={() => setActiveDropdown("attendantName")}
                autoComplete="off"
                style={{ paddingRight: "60px" }}
              />
              {inputValues.attendantName && (
                <FaTimes
                  className={styles.clearIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect("attendantName", "");
                  }}
                  title="Limpar Atendente"
                />
              )}
              <FaChevronDown
                className={styles.selectIcon}
                style={{ transform: activeDropdown === "attendantName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
              />
              {activeDropdown === "attendantName" && (
                <div className={styles.filterDropdown}>
                  {filterOptions.attendants
                    .filter(opt => opt.toLowerCase().includes(inputValues.attendantName.toLowerCase()))
                    .map((opt, idx) => (
                      <div
                        key={idx}
                        className={styles.filterDropdownItem}
                        onClick={() => handleOptionSelect("attendantName", opt)}
                      >
                        {opt}
                      </div>
                    ))}
                  {filterOptions.attendants.filter(opt => opt.toLowerCase().includes(inputValues.attendantName.toLowerCase())).length === 0 && (
                    <div className={styles.filterDropdownItemEmpty}>Nenhum atendente encontrado</div>
                  )}
                </div>
              )}
            </div>

            {/* SELECT COM PESQUISA: Item */}
            <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Filtrar por Item..."
                value={inputValues.itemName}
                onChange={(e) => handleTextTyping("itemName", e.target.value)}
                onClick={() => setActiveDropdown("itemName")}
                autoComplete="off"
                style={{ paddingRight: "60px" }}
              />
              {inputValues.itemName && (
                <FaTimes
                  className={styles.clearIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect("itemName", "");
                  }}
                  title="Limpar Item"
                />
              )}
              <FaChevronDown
                className={styles.selectIcon}
                style={{ transform: activeDropdown === "itemName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
              />
              {activeDropdown === "itemName" && (
                <div className={styles.filterDropdown}>
                  {filterOptions.items
                    .filter(opt => opt.toLowerCase().includes(inputValues.itemName.toLowerCase()))
                    .map((opt, idx) => (
                      <div
                        key={idx}
                        className={styles.filterDropdownItem}
                        onClick={() => handleOptionSelect("itemName", opt)}
                      >
                        {opt}
                      </div>
                    ))}
                  {filterOptions.items.filter(opt => opt.toLowerCase().includes(inputValues.itemName.toLowerCase())).length === 0 && (
                    <div className={styles.filterDropdownItemEmpty}>Nenhum item encontrado</div>
                  )}
                </div>
              )}
            </div>

            <button
              className={`${styles.cancelButton} ${styles.clearFilterButton}`}
              onClick={clearFilters}
              title="Limpar Filtros"
            >
              Limpar
            </button>
          </div>
          {/* FIM BARRA DE FILTROS */}

          <div className={styles.tableWrapper}>
            <table className={styles.beneficiariosTable}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Beneficiário</th>
                  <th>Atendente</th>
                  <th>Itens</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className={styles.loadingMessage}>Carregando...</td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noDataMessage}>
                      Nenhuma retirada encontrada.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.withdrawalId}>
                      <td>{formatDate(withdrawal.withdrawalDate)}</td>
                      <td>{withdrawal.beneficiary?.fullName || withdrawal.beneficiary?.name || 'N/A'}</td>
                      <td>{withdrawal.appUser?.name || withdrawal.appUser?.login || 'N/A'}</td>
                      <td>
                        {withdrawal.items && withdrawal.items.length > 0 ? (
                          <div>
                            {withdrawal.items.map((item, idx) => (
                              <span key={item.itemWithdrawnId || idx} style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>
                                {item.itemDTO?.description || item.itemDTO?.name || 'Item'} - Qtd: {item.quantity || 0}
                              </span>
                            ))}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(withdrawal.withdrawalId)}
                            title="Excluir"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Registrar Retirada</h2>
            <form onSubmit={handleSubmitWithdrawal}>
              {/* Seleção de Beneficiário */}
              <div className={styles.formSection}>
                <label>Beneficiário *</label>
                <input
                  type="text"
                  placeholder="Buscar beneficiário por nome ou CPF..."
                  value={searchBeneficiary}
                  onChange={(e) => setSearchBeneficiary(e.target.value)}
                  className={styles.searchInput}
                />
                {searchBeneficiary && (
                  <div className={styles.dropdown}>
                    {filteredBeneficiaries.length === 0 ? (
                      <div className={styles.dropdownItem}>Nenhum beneficiário encontrado</div>
                    ) : (
                      filteredBeneficiaries.map(beneficiary => (
                        <div
                          key={beneficiary.id}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setSelectedBeneficiary(beneficiary);
                            setSearchBeneficiary(beneficiary.nomeCompleto);
                          }}
                        >
                          <div><strong>{beneficiary.nomeCompleto}</strong></div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>CPF: {beneficiary.cpfCrnm || 'N/A'}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {selectedBeneficiary && (
                  <div className={styles.selectedInfo}>
                    <div><strong>Beneficiário selecionado:</strong> {selectedBeneficiary.nomeCompleto}</div>
                    {limitInfo && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '5px', fontSize: '0.9rem' }}>
                        <div><strong>Limite mensal:</strong> {limitInfo.itemsWithdrawnThisMonth || 0}/{limitInfo.monthlyLimit || 'N/A'} itens retirados este mês</div>
                        <div><strong>Restante:</strong> {limitInfo.remainingItems || 0} itens</div>
                        {isLimitBeingChecked && (
                          <div style={{ marginTop: '8px', color: '#856404', fontWeight: '600' }}>
                            Verificando o limite mensal do beneficiário...
                          </div>
                        )}

                        {beneficiaryHasNoLimit && (
                          <div style={{ marginTop: '8px', color: '#dc3545', fontWeight: '600' }}>
                            Este beneficiário não possui um limite mensal configurado.
                            Não é possível registrar uma retirada.
                          </div>
                        )}

                        {failedToLoadLimit && (
                          <div style={{ marginTop: '8px', color: '#dc3545', fontWeight: '600' }}>
                            Não foi possível verificar o limite mensal deste beneficiário.
                            Tente novamente antes de registrar a retirada.
                          </div>
                        )}
                        <span title={!isAdmin ? "Apenas administradores podem zerar o limite mensal" : ""} style={{ display: 'inline-block', marginTop: '5px' }}>
                          <button type="button" onClick={handleResetLimit} disabled={!isAdmin || submitting} className={styles.submitButton}>
                            Zerar Limite Mensal
                          </button>
                        </span>
                        {limitInfo.remainingItems !== null && limitInfo.remainingItems < totalItems && (
                          <div style={{ marginTop: '5px', color: '#dc3545', fontWeight: '600' }}>
                            Limite mensal atingido. Não é possível registrar esta retirada com a quantidade de itens selecionada.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Seleção de Itens */}
              <div className={styles.formSection}>
                <label>Itens *</label>
                <input
                  type="text"
                  placeholder="Buscar item por nome ou descrição..."
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  className={styles.searchInput}
                />
                {searchItem && (
                  <div className={styles.dropdown}>
                    {filteredItems.length === 0 ? (
                      <div className={styles.dropdownItem}>Nenhum item encontrado</div>
                    ) : (
                      filteredItems.map(item => (
                        <div
                          key={item.id}
                          className={styles.dropdownItem}
                          onClick={() => handleAddItem(item)}
                        >
                          <div><strong>{item.nome || item.descricao}</strong></div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Estoque: {item.quantidade} | Categoria: {item.categoria || 'N/A'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Itens Selecionados */}
                {selectedItems.length > 0 && (
                  <div className={styles.selectedItemsContainer}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#333' }}>Itens Selecionados</h3>
                    {selectedItems.map(si => {
                      const item = items.find(i => i.id === si.itemId);
                      return (
                        <div key={si.itemId} className={styles.selectedItem}>
                          <div className={styles.itemInfo}>
                            <strong>{item?.nome || item?.descricao || 'Item'}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              Disponível: {item?.quantidade || 0}
                            </div>
                          </div>
                          <div className={styles.itemControls}>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(si.itemId, -1)}
                              disabled={si.quantity <= 1}
                              className={styles.quantityButton}
                            >
                              <FaMinus />
                            </button>
                            <span className={styles.quantity}>{si.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(si.itemId, 1)}
                              disabled={si.quantity >= (item?.quantidade || 0)}
                              className={styles.quantityButton}
                            >
                              <FaPlus />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(si.itemId)}
                              className={styles.removeButton}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className={styles.total}>
                      <strong>Total de itens: {totalItems}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting || !selectedBeneficiary || selectedItems.length === 0 ||
                    isLimitBeingChecked || beneficiaryHasNoLimit || failedToLoadLimit || exceedsRemainingLimit}>
                  {submitting ? "Registrando..." : "Registrar Retirada"}
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, message: "", title: "" })}
        onConfirm={confirmModal.action}
        message={confirmModal.message}
        title={confirmModal.title}
      />
    </div >
  );
}
