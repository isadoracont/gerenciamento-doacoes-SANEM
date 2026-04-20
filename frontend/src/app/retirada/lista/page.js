"use client";
import React, { useState, useEffect } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import { useRouter } from "next/navigation";
import styles from "./lista.module.css";
import apiService from "../../../services/api";
import { useNotification } from "../../../components/notifications/NotificationProvider";
import { FaPlus, FaEdit, FaTrash, FaMinus } from "react-icons/fa";
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal";
import { mapBeneficiaryFromBackend, mapItemFromBackend } from "../../../services/dataMapper";
import authService from "../../../services/authService";

export default function ListaRetiradasPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: "", title: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchBeneficiary, setSearchBeneficiary] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);

  useEffect(() => {
    loadWithdrawals();
  }, []);

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

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWithdrawals();
      const withdrawalsArray = Array.isArray(data) ? data : [];
      
      // Ordenar do mais recente para o mais antigo por data de retirada
      const sortedWithdrawals = withdrawalsArray.sort((a, b) => {
        const dateA = a.withdrawalDate ? new Date(a.withdrawalDate).getTime() : 0;
        const dateB = b.withdrawalDate ? new Date(b.withdrawalDate).getTime() : 0;
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
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

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        try {
          await apiService.deleteWithdrawal(id);
          showNotification("Retirada excluída com sucesso!", "success");
          loadWithdrawals();
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
      console.error("Erro ao carregar beneficiários:", err);
      showNotification("Erro ao carregar beneficiários", "error");
    }
  };

  const loadItems = async () => {
    try {
      const data = await apiService.getItems();
      const mapped = (data || []).map(mapItemFromBackend).filter(item => item.quantidade > 0);
      setItems(mapped);
    } catch (err) {
      console.error("Erro ao carregar itens:", err);
      showNotification("Erro ao carregar itens", "error");
    }
  };

  const loadLimitInfo = async (beneficiaryId) => {
    try {
      const info = await apiService.getWithdrawalLimitInfo(beneficiaryId);
      setLimitInfo(info);
    } catch (err) {
      console.error("Erro ao carregar informações de limite:", err);
      setLimitInfo(null);
    }
  };

  const handleAdd = () => {
    setSelectedBeneficiary(null);
    setSelectedItems([]);
    setSearchBeneficiary("");
    setSearchItem("");
    setLimitInfo(null);
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
      if (!window.confirm(confirmMessage)) {
        return;
      }
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
      loadWithdrawals();
    } catch (err) {
      console.error("Erro ao registrar retirada:", err);
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
      console.error('Erro ao formatar data:', e);
      return 'N/A';
    }
  };

  const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0);

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>Retiradas Registradas</h1>
          <div className={styles.decoracao}></div>
          <div className={styles.actionsHeader}>
            <button
              className={styles.addButton}
              onClick={handleAdd}
              title="Registrar Nova Retirada"
            >
              <FaPlus />
            </button>
          </div>
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
                      Nenhuma retirada registrada ainda.
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
      {/* Modal de Registrar Retirada */}
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
                        {limitInfo.remainingItems !== null && limitInfo.remainingItems < totalItems && (
                          <div style={{ marginTop: '5px', color: '#dc3545', fontWeight: '600' }}>
                            Atenção: O total de itens selecionados ({totalItems}) excede o limite restante ({limitInfo.remainingItems})
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
                  disabled={submitting || !selectedBeneficiary || selectedItems.length === 0}
                >
                  {submitting ? "Registrando..." : "Registrar Retirada"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, message: "", title: "" })}
        onConfirm={confirmModal.action}
        message={confirmModal.message}
        title={confirmModal.title}
      />
    </div>
  );
}


