"use client";
import React, { useState, useEffect } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import { useRouter } from "next/navigation";
import styles from "./registrar.module.css";
import apiService from "../../../services/api";
import authService from "../../../services/authService";
import { useNotification } from "../../../components/notifications/NotificationProvider";
import { mapBeneficiaryFromBackend, mapItemFromBackend } from "../../../services/dataMapper";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";

export default function RegistrarRetiradaPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchBeneficiary, setSearchBeneficiary] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);

  useEffect(() => {
    loadBeneficiaries();
    loadItems();
  }, []);

  useEffect(() => {
    if (selectedBeneficiary) {
      loadLimitInfo(selectedBeneficiary.id);
    }
  }, [selectedBeneficiary]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBeneficiary) {
      showNotification("Selecione um beneficiário", "error");
      return;
    }

    if (selectedItems.length === 0) {
      showNotification("Adicione pelo menos um item", "error");
      return;
    }

    // Validar se o usuário está logado
    const user = authService.getUser();
    if (!user || !user.id) {
      showNotification("Usuário não autenticado. Por favor, faça login novamente.", "error");
      return;
    }

    // Validar se há itens com quantidade válida
    const invalidItems = selectedItems.filter(si => !si.itemId || !si.quantity || si.quantity <= 0);
    if (invalidItems.length > 0) {
      showNotification("Alguns itens possuem quantidade inválida", "error");
      return;
    }

    // Validar limite de retirada se houver informação disponível
    if (limitInfo && limitInfo.remainingItems !== null && limitInfo.remainingItems < totalItems) {
      const confirmMessage = `O total de itens selecionados (${totalItems}) excede o limite restante (${limitInfo.remainingItems}). Deseja continuar mesmo assim?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setLoading(true);
      
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
      
      // Redirecionar para lista
      setTimeout(() => {
        router.push("/retirada/lista");
      }, 1000);
    } catch (err) {
      console.error("Erro ao registrar retirada:", err);
      showNotification(err.message || "Erro ao registrar retirada", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0);

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.formContainer}>
          <h1 className={styles.titulo}>Registrar Retirada</h1>
          <div className={styles.decoracao}></div>

          <form onSubmit={handleSubmit}>
            {/* Seleção de Beneficiário */}
            <div className={styles.section}>
              <h2>Beneficiário</h2>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Buscar beneficiário por nome ou CPF..."
                  value={searchBeneficiary}
                  onChange={(e) => setSearchBeneficiary(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
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
                <div className={styles.selectedBeneficiary}>
                  <div>
                    <strong>Beneficiário selecionado:</strong> {selectedBeneficiary.nomeCompleto}
                  </div>
                  {limitInfo && (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
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
            <div className={styles.section}>
              <h2>Itens</h2>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Buscar item por nome ou descrição..."
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
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
                <div className={styles.selectedItems}>
                  <h3>Itens Selecionados</h3>
                  {selectedItems.map(si => {
                    const item = items.find(i => i.id === si.itemId);
                    return (
                      <div key={si.itemId} className={styles.selectedItem}>
                        <div className={styles.itemInfo}>
                          <strong>{item?.nome || item?.descricao || 'Item'}</strong>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
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

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => router.push("/retirada/lista")}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedBeneficiary || selectedItems.length === 0}
                className={styles.submitButton}
              >
                {loading ? "Registrando..." : "Registrar Retirada"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
