"use client";
import React, { useEffect, useState, useRef } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import styles from "./lista.module.css";
import { useRouter } from "next/navigation";
import apiService from "../../../services/api";
import { mapBeneficiaryFromBackend, mapBeneficiaryToBackend } from "../../../services/dataMapper";
import { useApiList } from "../../../hooks/useApi";
import { FaPlus, FaCheck, FaTimes, FaEdit, FaTrash, FaChevronDown } from "react-icons/fa";
import authService from "../../../services/authService";
import { useNotification } from "../../../components/notifications/NotificationProvider";
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal";
import { validateCPF, validateEmail, validatePhone } from "../../../utils/validators";
import { maskCPF, maskPhone, unmask } from "../../../utils/masks";

export default function ListaBeneficiarios() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [approvingId, setApprovingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estados para modais e formulários
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: "", title: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ nomeCompleto: "", telefoneCelular: "", email: "", cpfCrnm: "", nif: "", withdrawalLimit: "" });
  const [formErrors, setFormErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ nomeCompleto: "", telefoneCelular: "", email: "", cpfCrnm: "", nif: "", withdrawalLimit: "" });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);

  // --- LÓGICA DE FILTROS ---
  const [filters, setFilters] = useState({ name: '', cpfCnpj: '', phone: '', status: '' });
  const [debouncedFilters, setDebouncedFilters] = useState({ name: '', cpfCnpj: '', phone: '', status: '' });
  
  // Estados para o Dropdown Customizado de Status
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [statusInput, setStatusInput] = useState("");
  const dropdownRef = useRef(null);

  const statusOptions = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'REJECTED', label: 'Rejeitado' }
  ];

  const {
    data: beneficiariosRaw,
    loading,
    error,
    loadData: loadDataRaw,
  } = useApiList((apiFilters) => apiService.getBeneficiaries(apiFilters));

  const beneficiarios = Array.isArray(beneficiariosRaw)
    ? beneficiariosRaw.map(mapBeneficiaryFromBackend)
    : [];

  // Verifica permissões de Admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = authService.getUser();
        const roleName = (user?.role || '').toLowerCase();
        const isAdminByRole = roleName.includes('admin') || roleName.includes('administrator');
        if (isAdminByRole) {
          setIsAdmin(true); return;
        }
        if (user?.id) {
          try {
            const userData = await apiService.getUser(user.id);
            const profileName = (userData?.profile?.name || '').toLowerCase();
            const isAdminByProfile = userData?.profile?.profileId === 1 || profileName.includes('admin') || profileName.includes('administrator');
            setIsAdmin(isAdminByProfile);
            return;
          } catch (err) { console.error("Erro ao buscar dados:", err); }
        }
        const isAdminById = user?.perfilId === 1;
        setIsAdmin(isAdminByRole || isAdminById);
      } catch (err) { console.error("Erro ao verificar permissões:", err); }
    };
    checkAdmin();
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        // Se fechou, reseta o input para o valor real do filtro selecionado
        const selectedOpt = statusOptions.find(o => o.value === filters.status);
        setStatusInput(selectedOpt ? selectedOpt.label : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filters.status]);

  // Debounce para os filtros
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  // Busca no backend
  useEffect(() => {
    const activeFilters = {};
    if (debouncedFilters.name) activeFilters.fullName = debouncedFilters.name;
    if (debouncedFilters.cpfCnpj) activeFilters.cpf = unmask(debouncedFilters.cpfCnpj);
    if (debouncedFilters.phone) activeFilters.phone = unmask(debouncedFilters.phone);
    if (debouncedFilters.status) activeFilters.beneficiaryStatus = debouncedFilters.status;

    loadDataRaw(activeFilters).catch(err => {
      console.error("Erro ao carregar beneficiários filtrados:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  // Handler de inputs de texto normais
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "phone") processedValue = maskPhone(value);
    else if (name === "cpfCnpj") processedValue = maskCPF(value);
    setFilters(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleClearFilters = () => {
    setFilters({ name: '', cpfCnpj: '', phone: '', status: '' });
    setDebouncedFilters({ name: '', cpfCnpj: '', phone: '', status: '' });
    setStatusInput(""); // Limpa o input visual do dropdown de status
  };

  // Funções de CRUD
  const handleEdit = async (id) => {
    try {
      const beneficiary = await apiService.getBeneficiary(id);
      const mappedBeneficiary = mapBeneficiaryFromBackend(beneficiary);
      const telefoneMascarado = mappedBeneficiary.telefoneCelular ? maskPhone(mappedBeneficiary.telefoneCelular) : "";
      const cpfMascarado = mappedBeneficiary.cpfCrnm ? maskCPF(mappedBeneficiary.cpfCrnm) : "";
      
      setEditFormData({
        nomeCompleto: mappedBeneficiary.nomeCompleto || "",
        telefoneCelular: telefoneMascarado,
        email: mappedBeneficiary.email || "",
        cpfCrnm: cpfMascarado,
        nif: mappedBeneficiary.nif || "",
        withdrawalLimit: mappedBeneficiary.withdrawalLimit || ""
      });
      setEditFormErrors({});
      setEditFieldErrors({});
      setEditingBeneficiary(mappedBeneficiary);
      setShowEditModal(true);
    } catch (err) { showNotification(err.message || "Erro ao carregar beneficiário", "error"); }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        try {
          await apiService.deleteBeneficiary(id);
          await loadDataRaw();
          showNotification("Beneficiário excluído com sucesso!", "success");
        } catch (err) { showNotification(err.message || "Erro ao excluir beneficiário", "error"); }
      },
      message: "Tem certeza que deseja excluir este beneficiário?",
      title: "Confirmar Exclusão"
    });
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const user = authService.getUser();
      if (!user || !user.id) { showNotification("Erro: usuário não autenticado", "error"); return; }
      await apiService.approveBeneficiary(id, "APPROVED", user.id);
      showNotification("Beneficiário aprovado com sucesso!", "success");
      loadDataRaw();
    } catch (err) { showNotification("Erro ao aprovar beneficiário", "error");
    } finally { setApprovingId(null); }
  };

  const handleReject = async (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        setApprovingId(id);
        try {
          const user = authService.getUser();
          if (!user || !user.id) { showNotification("Erro: usuário não autenticado", "error"); return; }
          await apiService.approveBeneficiary(id, "REJECTED", user.id);
          showNotification("Beneficiário rejeitado com sucesso!", "success");
          loadDataRaw();
        } catch (err) { showNotification("Erro ao rejeitar beneficiário", "error");
        } finally { setApprovingId(null); }
      },
      message: "Tem certeza que deseja rejeitar este beneficiário?",
      title: "Confirmar Rejeição"
    });
  };

  const handleConfirm = async () => {
    if (confirmModal.action) await confirmModal.action();
    setConfirmModal({ isOpen: false, action: null, message: "", title: "" });
  };

  const handleAdd = () => {
    setFormData({ nomeCompleto: "", telefoneCelular: "", email: "", cpfCrnm: "", nif: "", withdrawalLimit: "" });
    setFormErrors({}); setFieldErrors({});
    setShowAddModal(true);
  };

  // Funções de Validação e Submit (Omitidas por questão de espaço, elas permanecem exatamente as mesmas do seu código original)
  const validateField = (name, value) => {
    let validation = { valid: true, message: "" };
    switch (name) {
      case "email": validation = validateEmail(value); break;
      case "telefoneCelular": validation = validatePhone(value); break;
      case "cpfCrnm": if (value) validation = validateCPF(value); break;
      case "nif": if (value && !/^\d+$/.test(value.replace(/\D/g, ""))) validation = { valid: false, message: "NIF deve conter apenas números" }; break;
      default: validation = { valid: true };
    }
    setFieldErrors(prev => ({ ...prev, [name]: validation.valid ? "" : validation.message }));
    return validation.valid;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "telefoneCelular") processedValue = maskPhone(value);
    else if (name === "cpfCrnm") processedValue = maskCPF(value);
    setFormData({ ...formData, [name]: processedValue });
    if (["email", "telefoneCelular", "cpfCrnm", "nif"].includes(name) && (processedValue.length > 0 || fieldErrors[name] !== undefined)) {
      validateField(name, processedValue);
    }
  };

  const handleFieldBlur = (e) => validateField(e.target.name, e.target.value);

  const validateForm = () => {
    const errors = {};
    if (!formData.nomeCompleto.trim()) errors.nomeCompleto = "Nome completo é obrigatório";
    if (!formData.email.trim()) errors.email = "Email é obrigatório";
    else if (!validateEmail(formData.email).valid) errors.email = validateEmail(formData.email).message;
    if (!formData.telefoneCelular.trim()) errors.telefoneCelular = "Telefone é obrigatório";
    else if (!validatePhone(formData.telefoneCelular).valid) errors.telefoneCelular = validatePhone(formData.telefoneCelular).message;
    const cpfCrnmLimpo = formData.cpfCrnm.replace(/\D/g, "");
    const nifLimpo = formData.nif.replace(/\D/g, "");
    if (cpfCrnmLimpo.length === 0 && nifLimpo.length === 0) {
      errors.cpfCrnm = "É obrigatório preencher pelo menos um dos campos: CPF/CRNM ou NIF";
    } else if (cpfCrnmLimpo.length > 0 && !validateCPF(formData.cpfCrnm).valid) {
      errors.cpfCrnm = validateCPF(formData.cpfCrnm).message;
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    try {
      const cpfCrnmLimpo = unmask(formData.cpfCrnm);
      const nifLimpo = unmask(formData.nif);
      const phoneValidation = validatePhone(formData.telefoneCelular);
      const beneficiaryData = mapBeneficiaryToBackend({
        ...formData,
        cpfCrnm: cpfCrnmLimpo.length > 0 ? cpfCrnmLimpo : null,
        nif: nifLimpo.length > 0 ? nifLimpo : null,
        telefoneCelular: phoneValidation.cleaned
      });
      await apiService.createBeneficiary(beneficiaryData);
      showNotification("Beneficiário cadastrado com sucesso!", "success");
      setShowAddModal(false);
      loadDataRaw();
    } catch (err) { showNotification(err.message || "Erro ao criar beneficiário", "error"); }
  };

  const validateEditField = (name, value) => {
    let validation = { valid: true, message: "" };
    switch (name) {
      case "email": validation = validateEmail(value); break;
      case "telefoneCelular": validation = validatePhone(value); break;
      case "cpfCrnm": if (value) validation = validateCPF(value); break;
      case "nif": if (value && !/^\d+$/.test(value.replace(/\D/g, ""))) validation = { valid: false, message: "NIF deve conter apenas números" }; break;
      default: validation = { valid: true };
    }
    setEditFieldErrors(prev => ({ ...prev, [name]: validation.valid ? "" : validation.message }));
    return validation.valid;
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "telefoneCelular") processedValue = maskPhone(value);
    else if (name === "cpfCrnm") processedValue = maskCPF(value);
    setEditFormData({ ...editFormData, [name]: processedValue });
    if (["email", "telefoneCelular", "cpfCrnm", "nif"].includes(name) && (processedValue.length > 0 || editFieldErrors[name] !== undefined)) {
      validateEditField(name, processedValue);
    }
  };

  const handleEditFieldBlur = (e) => validateEditField(e.target.name, e.target.value);

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.nomeCompleto.trim()) errors.nomeCompleto = "Nome completo é obrigatório";
    if (!editFormData.email.trim()) errors.email = "Email é obrigatório";
    else if (!validateEmail(editFormData.email).valid) errors.email = validateEmail(editFormData.email).message;
    if (!editFormData.telefoneCelular.trim()) errors.telefoneCelular = "Telefone é obrigatório";
    else if (!validatePhone(editFormData.telefoneCelular).valid) errors.telefoneCelular = validatePhone(editFormData.telefoneCelular).message;
    const cpfCrnmLimpo = editFormData.cpfCrnm.replace(/\D/g, "");
    const nifLimpo = editFormData.nif.replace(/\D/g, "");
    if (cpfCrnmLimpo.length === 0 && nifLimpo.length === 0) {
      errors.cpfCrnm = "É obrigatório preencher pelo menos um dos campos: CPF/CRNM ou NIF";
    } else if (cpfCrnmLimpo.length > 0 && !validateCPF(editFormData.cpfCrnm).valid) {
      errors.cpfCrnm = validateCPF(editFormData.cpfCrnm).message;
    }
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) { setEditFormErrors(errors); return; }
    try {
      const cpfCrnmLimpo = unmask(editFormData.cpfCrnm);
      const nifLimpo = unmask(editFormData.nif);
      const phoneValidation = validatePhone(editFormData.telefoneCelular);
      if (cpfCrnmLimpo.length === 0 && nifLimpo.length === 0) {
        showNotification("É obrigatório preencher pelo menos um dos campos: CPF/CRNM ou NIF.", "error"); return;
      }
      if (!phoneValidation.valid) {
        showNotification(phoneValidation.message, "error"); return;
      }
      const beneficiaryData = {
        fullName: editFormData.nomeCompleto,
        cpf: cpfCrnmLimpo || nifLimpo,
        phone: phoneValidation.cleaned,
        socioeconomicData:  'MODIFICAR PARA APARECER NO FRONT',
        beneficiaryStatus: editingBeneficiary.status || 'PENDING',
        withdrawalLimit: editFormData.withdrawalLimit ? parseInt(editFormData.withdrawalLimit) : null
      };
      await apiService.updateBeneficiary(editingBeneficiary.id, beneficiaryData);
      showNotification("Beneficiário atualizado com sucesso!", "success");
      setShowEditModal(false); setEditingBeneficiary(null);
      loadDataRaw();
    } catch (err) { showNotification(err.message || "Erro ao atualizar beneficiário", "error"); }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING": return "Pendente";
      case "APPROVED": return "Aprovado";
      case "REJECTED": return "Rejeitado";
      default: return status || "N/A";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING": return styles.statusPending;
      case "APPROVED": return styles.statusApproved;
      case "REJECTED": return styles.statusRejected;
      default: return "";
    }
  };

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          
          <div className={styles.pageHeader}>
            <h1 className={styles.titulo}>Beneficiários Cadastrados</h1>
            <button
              className={styles.addButton}
              onClick={handleAdd}
              title="Adicionar Novo Beneficiário"
            >
              <FaPlus />
            </button>
          </div>
          <div className={styles.decoracao}></div>

          {/* ÁREA DE FILTROS C/ REF PARA DROPDOWN */}
          <div className={styles.filtersContainer} ref={dropdownRef}>
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
                placeholder="CPF ou CRNM..." 
                maxLength={14}
                value={filters.cpfCnpj}
                onChange={handleFilterChange}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.filterGroupText}`}>
              <input 
                type="tel" 
                name="phone"
                placeholder="Telefone..." 
                maxLength={15}
                value={filters.phone}
                onChange={handleFilterChange}
              />
            </div>
            
            {/* DROPDOWN CUSTOMIZADO DE STATUS */}
            <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
              <input 
                type="text"
                placeholder="Filtrar por Status..." 
                value={statusInput}
                onChange={(e) => {
                  setStatusInput(e.target.value);
                  setActiveDropdown("status");
                  if (e.target.value.trim() === "") {
                    setFilters(prev => ({ ...prev, status: "" }));
                  }
                }}
                onClick={() => setActiveDropdown("status")}
                autoComplete="off"
                style={{ paddingRight: "60px" }}
              />
              {statusInput && (
                <FaTimes 
                  className={styles.clearIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusInput("");
                    setFilters(prev => ({ ...prev, status: "" }));
                  }}
                  title="Limpar Status"
                />
              )}
              <FaChevronDown 
                className={styles.selectIcon} 
                style={{ transform: activeDropdown === "status" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }} 
              />
              {activeDropdown === "status" && (
                <div className={styles.filterDropdown}>
                  {statusOptions
                    .filter(opt => opt.label.toLowerCase().includes(statusInput.toLowerCase()))
                    .map((opt, idx) => (
                      <div 
                        key={idx} 
                        className={styles.filterDropdownItem}
                        onClick={() => {
                          setStatusInput(opt.label);
                          setFilters(prev => ({ ...prev, status: opt.value }));
                          setActiveDropdown(null);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  {statusOptions.filter(opt => opt.label.toLowerCase().includes(statusInput.toLowerCase())).length === 0 && (
                    <div className={styles.filterDropdownItemEmpty}>Nenhum status encontrado</div>
                  )}
                </div>
              )}
            </div>

            <button 
              className={`${styles.cancelButton} ${styles.clearFilterButton}`} 
              onClick={handleClearFilters}
              title="Limpar Filtros"
            >
              Limpar
            </button>
          </div>

          {/* TABELA E MODAIS (Continuam iguais ao original) */}
          <div className={styles.tableWrapper}>
            <table className={styles.beneficiariosTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CRNM</th>
                  <th>Telefone</th>
                  <th>Retiradas Restantes</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={styles.loadingMessage}>Carregando...</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className={styles.errorMessage}>{error}</td></tr>
                ) : beneficiarios.length === 0 ? (
                  <tr><td colSpan={6} className={styles.noDataMessage}>Nenhum beneficiário encontrado.</td></tr>
                ) : (
                  beneficiarios.map((b) => (
                    <tr key={b.id}>
                      <td>{b.nomeCompleto}</td>
                      <td>{b.cpfCrnm ? maskCPF(b.cpfCrnm) : (b.nif || '-')}</td>
                      <td>{b.telefoneCelular ? maskPhone(b.telefoneCelular) : '-'}</td>
                      <td>{b.remainingWithdrawals !== undefined && b.remainingWithdrawals !== null ? `${b.remainingWithdrawals}/${b.withdrawalLimit || 0}` : '-'}</td>
                      <td><span className={getStatusClass(b.status)}>{getStatusLabel(b.status)}</span></td>
                      <td className={styles.actionButtons}>
                        <button className={styles.editButton} onClick={() => handleEdit(b.id)} disabled={loading} title="Editar"><FaEdit /></button>
                        {isAdmin && b.status === "PENDING" && (
                          <>
                            <button className={styles.approveButton} onClick={() => handleApprove(b.id)} disabled={loading || approvingId === b.id} title="Aprovar"><FaCheck /></button>
                            <button className={styles.rejectButton} onClick={() => handleReject(b.id)} disabled={loading || approvingId === b.id} title="Rejeitar"><FaTimes /></button>
                          </>
                        )}
                        <button className={styles.deleteButton} onClick={() => handleDelete(b.id)} disabled={loading} title="Excluir"><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Adicionar */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Criar Novo Beneficiário</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input type="text" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleFieldChange} className={formErrors.nomeCompleto ? styles.inputError : ''} />
                {formErrors.nomeCompleto && <span className={styles.errorText}>{formErrors.nomeCompleto}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleFieldChange} onBlur={handleFieldBlur} className={formErrors.email || fieldErrors.email ? styles.inputError : ''} />
                {(formErrors.email || fieldErrors.email) && <span className={styles.errorText}>{formErrors.email || fieldErrors.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Telefone *</label>
                <input type="tel" name="telefoneCelular" value={formData.telefoneCelular} onChange={handleFieldChange} onBlur={handleFieldBlur} placeholder="(45) 9 9988-7766" maxLength={15} className={formErrors.telefoneCelular || fieldErrors.telefoneCelular ? styles.inputError : ''} />
                {(formErrors.telefoneCelular || fieldErrors.telefoneCelular) && <span className={styles.errorText}>{formErrors.telefoneCelular || fieldErrors.telefoneCelular}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>CPF/CRNM</label>
                <input type="text" name="cpfCrnm" value={formData.cpfCrnm} onChange={handleFieldChange} onBlur={handleFieldBlur} placeholder="000.000.000-00" maxLength={14} className={formErrors.cpfCrnm || fieldErrors.cpfCrnm ? styles.inputError : ''} />
                {(formErrors.cpfCrnm || fieldErrors.cpfCrnm) && <span className={styles.errorText}>{formErrors.cpfCrnm || fieldErrors.cpfCrnm}</span>}
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>Preencha CPF/CRNM ou NIF (pelo menos um é obrigatório)</small>
              </div>
              <div className={styles.formGroup}>
                <label>NIF</label>
                <input type="text" name="nif" value={formData.nif} onChange={(e) => { const onlyNums = e.target.value.replace(/\D/g, ""); setFormData({ ...formData, nif: onlyNums }); if (fieldErrors.nif !== undefined || onlyNums.length > 0) validateField("nif", onlyNums); }} onBlur={handleFieldBlur} placeholder="123456789" className={formErrors.nif || fieldErrors.nif ? styles.inputError : ''} />
                {(formErrors.nif || fieldErrors.nif) && <span className={styles.errorText}>{formErrors.nif || fieldErrors.nif}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Limite de Retiradas Mensais (opcional)</label>
                <input type="number" name="withdrawalLimit" min="0" value={formData.withdrawalLimit} onChange={handleFieldChange} placeholder="Ex: 10" />
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>Deixe em branco para usar o limite global</small>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? "Criando..." : "Criar Beneficiário"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && editingBeneficiary && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Editar Beneficiário</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input type="text" name="nomeCompleto" value={editFormData.nomeCompleto} onChange={handleEditFieldChange} className={editFormErrors.nomeCompleto ? styles.inputError : ''} />
                {editFormErrors.nomeCompleto && <span className={styles.errorText}>{editFormErrors.nomeCompleto}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input type="email" name="email" value={editFormData.email} onChange={handleEditFieldChange} onBlur={handleEditFieldBlur} className={editFormErrors.email || editFieldErrors.email ? styles.inputError : ''} />
                {(editFormErrors.email || editFieldErrors.email) && <span className={styles.errorText}>{editFormErrors.email || editFieldErrors.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Telefone *</label>
                <input type="tel" name="telefoneCelular" value={editFormData.telefoneCelular} onChange={handleEditFieldChange} onBlur={handleEditFieldBlur} placeholder="(45) 9 9988-7766" maxLength={15} className={editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular ? styles.inputError : ''} />
                {(editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular) && <span className={styles.errorText}>{editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>CPF/CRNM</label>
                <input type="text" name="cpfCrnm" value={editFormData.cpfCrnm} onChange={handleEditFieldChange} onBlur={handleEditFieldBlur} placeholder="000.000.000-00" maxLength={14} className={editFormErrors.cpfCrnm || editFieldErrors.cpfCrnm ? styles.inputError : ''} />
                {(editFormErrors.cpfCrnm || editFieldErrors.cpfCrnm) && <span className={styles.errorText}>{editFormErrors.cpfCrnm || editFieldErrors.cpfCrnm}</span>}
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>Preencha CPF/CRNM ou NIF (pelo menos um é obrigatório)</small>
              </div>
              <div className={styles.formGroup}>
                <label>NIF</label>
                <input type="text" name="nif" value={editFormData.nif} onChange={(e) => { const onlyNums = e.target.value.replace(/\D/g, ""); setEditFormData({ ...editFormData, nif: onlyNums }); if (editFieldErrors.nif !== undefined || onlyNums.length > 0) validateEditField("nif", onlyNums); }} onBlur={handleEditFieldBlur} placeholder="123456789" className={editFormErrors.nif || editFieldErrors.nif ? styles.inputError : ''} />
                {(editFormErrors.nif || editFieldErrors.nif) && <span className={styles.errorText}>{editFormErrors.nif || editFieldErrors.nif}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Limite de Retiradas Mensais (opcional)</label>
                <input type="number" name="withdrawalLimit" min="0" value={editFormData.withdrawalLimit} onChange={handleEditFieldChange} placeholder="Ex: 10" />
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>Deixe em branco para usar o limite global</small>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => { setShowEditModal(false); setEditingBeneficiary(null); }}>Cancelar</button>
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