"use client";
import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import styles from "./lista.module.css";
import { useRouter } from "next/navigation";
import apiService from "../../../services/api";
import { mapDonorFromBackend, mapDonorToBackend } from "../../../services/dataMapper";
import { useApiList } from "../../../hooks/useApi";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNotification } from "../../../components/notifications/NotificationProvider";
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal";
import { validateCPForCNPJ, validateEmail, validatePhone } from "../../../utils/validators";
import { maskCPForCNPJ, maskPhone, unmask } from "../../../utils/masks";

export default function ListaDoadores() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // Estados para modais e formulários
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: "", title: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ nomeCompleto: "", telefoneCelular: "", email: "", cpf: "" });
  const [formErrors, setFormErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ nomeCompleto: "", telefoneCelular: "", email: "", cpf: "" });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editingDonor, setEditingDonor] = useState(null);

  // --- NOVOS ESTADOS PARA OS FILTROS ---
  const [filters, setFilters] = useState({ name: '', cpfCnpj: '', contact: '', email: '' });
  const [debouncedFilters, setDebouncedFilters] = useState({ name: '', cpfCnpj: '', contact: '', email: '' });

  const {
    data: doadoresRaw,
    loading,
    error,
    loadData: loadDataRaw,
  } = useApiList((apiFilters) => apiService.getDonors(apiFilters));

  const doadores = Array.isArray(doadoresRaw) ? doadoresRaw.map(mapDonorFromBackend) : [];

  // --- LÓGICA DE DEBOUNCE PARA OS FILTROS ---
  // Aguarda 500ms após o usuário parar de digitar para atualizar o filtro real
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  // --- LÓGICA DE BUSCA COM FILTROS ---
  useEffect(() => {
    const activeFilters = {};
    if (debouncedFilters.name) activeFilters.name = debouncedFilters.name;
    if (debouncedFilters.email) activeFilters.email = debouncedFilters.email;
    // Removemos a máscara antes de mandar para o backend, pois o DB guarda sem máscara
    if (debouncedFilters.cpfCnpj) activeFilters.cpfCnpj = unmask(debouncedFilters.cpfCnpj);
    if (debouncedFilters.contact) activeFilters.contact = unmask(debouncedFilters.contact);

    loadDataRaw(activeFilters).catch(err => {
      console.error("Erro ao carregar doadores filtrados:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  // Manipulador de mudança dos filtros aplicando máscaras
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "contact") {
      processedValue = maskPhone(value);
    } else if (name === "cpfCnpj") {
      processedValue = maskCPForCNPJ(value);
    }

    setFilters(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleClearFilters = () => {
    setFilters({ name: '', cpfCnpj: '', contact: '', email: '' });
    setDebouncedFilters({ name: '', cpfCnpj: '', contact: '', email: '' });
  };

  // Funções de CRUD (Mantinadas como estavam)
  const handleEdit = async (id) => {
    try {
      const donor = await apiService.getDonor(id);
      const mappedDonor = mapDonorFromBackend(donor);
      const telefoneMascarado = mappedDonor.telefoneCelular ? maskPhone(mappedDonor.telefoneCelular) : "";
      const cpfMascarado = mappedDonor.cpf ? maskCPForCNPJ(mappedDonor.cpf) : "";
      
      setEditFormData({
        nomeCompleto: mappedDonor.nomeCompleto || "",
        telefoneCelular: telefoneMascarado,
        email: mappedDonor.email || "",
        cpf: cpfMascarado
      });
      setEditFormErrors({});
      setEditFieldErrors({});
      setEditingDonor(mappedDonor);
      setShowEditModal(true);
    } catch (err) {
      showNotification(err.message || "Erro ao carregar doador", "error");
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        try {
          await apiService.deleteDonor(id);
          await loadDataRaw();
          showNotification("Doador excluído com sucesso!", "success");
        } catch (err) {
          showNotification(err.message || "Erro ao excluir doador", "error");
        }
      },
      message: "Tem certeza que deseja excluir este doador?",
      title: "Confirmar Exclusão"
    });
  };

  const handleConfirm = async () => {
    if (confirmModal.action) await confirmModal.action();
    setConfirmModal({ isOpen: false, action: null, message: "", title: "" });
  };

  const handleAdd = () => {
    setFormData({ nomeCompleto: "", telefoneCelular: "", email: "", cpf: "" });
    setFormErrors({});
    setFieldErrors({});
    setShowAddModal(true);
  };

  const validateField = (name, value, isEdit = false) => {
    let validation = { valid: true, message: "" };
    switch (name) {
      case "email": validation = validateEmail(value); break;
      case "telefoneCelular": validation = validatePhone(value); break;
      case "cpf": if (value) validation = validateCPForCNPJ(value); break;
      default: validation = { valid: true };
    }

    if (isEdit) {
      setEditFieldErrors(prev => ({ ...prev, [name]: validation.valid ? "" : validation.message }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: validation.valid ? "" : validation.message }));
    }
    return validation.valid;
  };

  const handleFieldChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === "telefoneCelular") processedValue = maskPhone(value);
    else if (name === "cpf") processedValue = maskCPForCNPJ(value);
    
    if (isEdit) {
      setEditFormData({ ...editFormData, [name]: processedValue });
      if (["email", "telefoneCelular", "cpf"].includes(name) && (processedValue.length > 0 || editFieldErrors[name] !== undefined)) {
        validateField(name, processedValue, true);
      }
    } else {
      setFormData({ ...formData, [name]: processedValue });
      if (["email", "telefoneCelular", "cpf"].includes(name) && (processedValue.length > 0 || fieldErrors[name] !== undefined)) {
        validateField(name, processedValue, false);
      }
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.nomeCompleto.trim()) errors.nomeCompleto = "Nome completo é obrigatório";
    if (!data.email.trim()) errors.email = "Email é obrigatório";
    else if (!validateEmail(data.email).valid) errors.email = validateEmail(data.email).message;
    if (!data.telefoneCelular.trim()) errors.telefoneCelular = "Telefone é obrigatório";
    else if (!validatePhone(data.telefoneCelular).valid) errors.telefoneCelular = validatePhone(data.telefoneCelular).message;
    if (!data.cpf.trim()) errors.cpf = "CPF/CNPJ é obrigatório";
    else if (!validateCPForCNPJ(data.cpf).valid) errors.cpf = validateCPForCNPJ(data.cpf).message;
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const cpfCnpjValidation = validateCPForCNPJ(formData.cpf);
      const phoneValidation = validatePhone(formData.telefoneCelular);
      
      const donorData = mapDonorToBackend({
        ...formData,
        cpf: cpfCnpjValidation.cleaned,
        telefoneCelular: phoneValidation.cleaned
      });

      await apiService.createDonor(donorData);
      showNotification("Doador cadastrado com sucesso!", "success");
      setShowAddModal(false);
      loadDataRaw();
    } catch (err) {
      showNotification(err.message || "Erro ao criar doador", "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      const cpfCnpjValidation = validateCPForCNPJ(editFormData.cpf);
      const phoneValidation = validatePhone(editFormData.telefoneCelular);
      
      const donorData = mapDonorToBackend({
        ...editFormData,
        cpf: cpfCnpjValidation.cleaned,
        telefoneCelular: phoneValidation.cleaned
      });

      await apiService.updateDonor(editingDonor.id, donorData);
      showNotification("Doador atualizado com sucesso!", "success");
      setShowEditModal(false);
      setEditingDonor(null);
      loadDataRaw();
    } catch (err) {
      showNotification(err.message || "Erro ao atualizar doador", "error");
    }
  };

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          
          {/* Cabeçalho Ajustado - Igual ao Estoque */}
          <div className={styles.pageHeader}>
            <h1 className={styles.titulo}>Doadores Cadastrados</h1>
            <button
              className={styles.addButton}
              onClick={handleAdd}
              title="Adicionar Novo Doador"
            >
              <FaPlus />
            </button>
          </div>

          <div className={styles.decoracao}></div>

          {/* NOVO: Área de Filtros */}
          <div className={styles.filtersContainer}>
            <div className={`${styles.formGroup} ${styles.filterGroupText}`}>
              <input 
                type="text" 
                name="name"
                placeholder="Filtrar por nome..." 
                value={filters.name}
                onChange={handleFilterChange}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.filterGroupText}`}>
              <input 
                type="text" 
                name="cpfCnpj"
                placeholder="CPF ou CNPJ..." 
                maxLength={18}
                value={filters.cpfCnpj}
                onChange={handleFilterChange}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.filterGroupText}`}>
              <input 
                type="tel" 
                name="contact"
                placeholder="Telefone..." 
                maxLength={15}
                value={filters.contact}
                onChange={handleFilterChange}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.filterGroupText}`}>
              <input 
                type="email" 
                name="email"
                placeholder="E-mail..." 
                value={filters.email}
                onChange={handleFilterChange}
              />
            </div>
            <button 
              className={`${styles.cancelButton} ${styles.clearFilterButton}`} 
              onClick={handleClearFilters}
            >
              Limpar
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.beneficiariosTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CNPJ</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className={styles.loadingMessage}>Carregando...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className={styles.errorMessage}>{error}</td>
                  </tr>
                ) : doadores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noDataMessage}>Nenhum doador encontrado.</td>
                  </tr>
                ) : (
                  doadores.map((d) => (
                    <tr key={d.id}>
                      <td>{d.nomeCompleto}</td>
                      <td>{d.cpf ? maskCPForCNPJ(d.cpf) : '-'}</td>
                      <td>{d.telefoneCelular ? maskPhone(d.telefoneCelular) : '-'}</td>
                      <td>{d.email}</td>
                      <td className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(d.id)}
                          disabled={loading}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(d.id)}
                          disabled={loading}
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Doador */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Criar Novo Doador</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text" name="nomeCompleto" value={formData.nomeCompleto}
                  onChange={(e) => handleFieldChange(e, false)}
                  className={formErrors.nomeCompleto ? styles.inputError : ''}
                />
                {formErrors.nomeCompleto && <span className={styles.errorText}>{formErrors.nomeCompleto}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={(e) => handleFieldChange(e, false)}
                  onBlur={(e) => validateField("email", e.target.value, false)}
                  className={formErrors.email || fieldErrors.email ? styles.inputError : ''}
                />
                {(formErrors.email || fieldErrors.email) && <span className={styles.errorText}>{formErrors.email || fieldErrors.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Telefone *</label>
                <input
                  type="tel" name="telefoneCelular" value={formData.telefoneCelular}
                  onChange={(e) => handleFieldChange(e, false)}
                  onBlur={(e) => validateField("telefoneCelular", e.target.value, false)}
                  placeholder="(45) 9 9988-7766" maxLength={15}
                  className={formErrors.telefoneCelular || fieldErrors.telefoneCelular ? styles.inputError : ''}
                />
                {(formErrors.telefoneCelular || fieldErrors.telefoneCelular) && <span className={styles.errorText}>{formErrors.telefoneCelular || fieldErrors.telefoneCelular}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>CPF/CNPJ *</label>
                <input
                  type="text" name="cpf" value={formData.cpf}
                  onChange={(e) => handleFieldChange(e, false)}
                  onBlur={(e) => validateField("cpf", e.target.value, false)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00" maxLength={18}
                  className={formErrors.cpf || fieldErrors.cpf ? styles.inputError : ''}
                />
                {(formErrors.cpf || fieldErrors.cpf) && <span className={styles.errorText}>{formErrors.cpf || fieldErrors.cpf}</span>}
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? "Criando..." : "Criar Doador"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Doador */}
      {showEditModal && editingDonor && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Editar Doador</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text" name="nomeCompleto" value={editFormData.nomeCompleto}
                  onChange={(e) => handleFieldChange(e, true)}
                  className={editFormErrors.nomeCompleto ? styles.inputError : ''}
                />
                {editFormErrors.nomeCompleto && <span className={styles.errorText}>{editFormErrors.nomeCompleto}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email" name="email" value={editFormData.email}
                  onChange={(e) => handleFieldChange(e, true)}
                  onBlur={(e) => validateField("email", e.target.value, true)}
                  className={editFormErrors.email || editFieldErrors.email ? styles.inputError : ''}
                />
                {(editFormErrors.email || editFieldErrors.email) && <span className={styles.errorText}>{editFormErrors.email || editFieldErrors.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Telefone *</label>
                <input
                  type="tel" name="telefoneCelular" value={editFormData.telefoneCelular}
                  onChange={(e) => handleFieldChange(e, true)}
                  onBlur={(e) => validateField("telefoneCelular", e.target.value, true)}
                  placeholder="(45) 9 9988-7766" maxLength={15}
                  className={editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular ? styles.inputError : ''}
                />
                {(editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular) && <span className={styles.errorText}>{editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>CPF/CNPJ *</label>
                <input
                  type="text" name="cpf" value={editFormData.cpf}
                  onChange={(e) => handleFieldChange(e, true)}
                  onBlur={(e) => validateField("cpf", e.target.value, true)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00" maxLength={18}
                  className={editFormErrors.cpf || editFieldErrors.cpf ? styles.inputError : ''}
                />
                {(editFormErrors.cpf || editFieldErrors.cpf) && <span className={styles.errorText}>{editFormErrors.cpf || editFieldErrors.cpf}</span>}
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => { setShowEditModal(false); setEditingDonor(null); }}>Cancelar</button>
                <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? "Salvando..." : "Salvar Alterações"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, message: "", title: "" })}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}