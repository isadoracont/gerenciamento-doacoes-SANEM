"use client";
import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
// Importar o CSS Modules específico para a lista
import styles from "./lista.module.css";
// Se você mantiver o formContainer no styles de cadastrobeneficiario, importe-o também
// import formStyles from "../cadastrobeneficiario.module.css";
import { useRouter } from "next/navigation";
import apiService from "../../../services/api";
import { mapBeneficiaryFromBackend } from "../../../services/dataMapper";
import { useApiList } from "../../../hooks/useApi";
import { FaPlus, FaCheck, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import authService from "../../../services/authService";
import { useNotification } from "../../../components/notifications/NotificationProvider";
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal";
import { validateCPF, validateEmail, validatePhone } from "../../../utils/validators";
import { mapBeneficiaryToBackend } from "../../../services/dataMapper";
import { maskCPF, maskPhone, unmask } from "../../../utils/masks";

export default function ListaBeneficiarios() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [approvingId, setApprovingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: "", title: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    telefoneCelular: "",
    email: "",
    cpfCrnm: "",
    nif: "",
    endereco: "",
    bairro: "",
    numero: "",
    complemento: "",
    pontoReferencia: "",
    withdrawalLimit: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nomeCompleto: "",
    telefoneCelular: "",
    email: "",
    cpfCrnm: "",
    nif: "",
    endereco: "",
    bairro: "",
    numero: "",
    complemento: "",
    pontoReferencia: "",
    withdrawalLimit: ""
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);

  const {
    data: beneficiariosRaw,
    loading,
    error,
    loadData: loadDataRaw,
    removeItem,
    clearError
  } = useApiList((filters) => apiService.getBeneficiaries(filters));

  const beneficiarios = Array.isArray(beneficiariosRaw)
    ? beneficiariosRaw.map(mapBeneficiaryFromBackend)
    : [];

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = authService.getUser();
        // Verificar se é admin baseado no nome do perfil
        const roleName = (user?.role || '').toLowerCase();
        const isAdminByRole = roleName.includes('admin') || roleName.includes('administrator');
        
        if (isAdminByRole) {
          setIsAdmin(true);
          return;
        }
        
        // Se não tiver perfilId salvo, buscar o perfil completo do usuário atual
        if (user?.id) {
          try {
            const userData = await apiService.getUser(user.id);
            const profileName = (userData?.profile?.name || '').toLowerCase();
            const isAdminByProfile = userData?.profile?.profileId === 1 || 
                                     profileName.includes('admin') ||
                                     profileName.includes('administrator');
            setIsAdmin(isAdminByProfile);
            return;
          } catch (err) {
            console.error("Erro ao buscar dados do usuário:", err);
          }
        }
        
        // Verificar pelo perfilId se disponível (perfilId 1 é Administrator)
        const isAdminById = user?.perfilId === 1;
        setIsAdmin(isAdminByRole || isAdminById);
      } catch (err) {
        console.error("Erro ao verificar permissões:", err);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    loadDataRaw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = async (id) => {
    try {
      const beneficiary = await apiService.getBeneficiary(id);
      const mappedBeneficiary = mapBeneficiaryFromBackend(beneficiary);
      // Aplica máscaras nos valores carregados
      const telefoneMascarado = mappedBeneficiary.telefoneCelular 
        ? maskPhone(mappedBeneficiary.telefoneCelular) 
        : "";
      const cpfMascarado = mappedBeneficiary.cpfCrnm 
        ? maskCPF(mappedBeneficiary.cpfCrnm) 
        : "";
      
      setEditFormData({
        nomeCompleto: mappedBeneficiary.nomeCompleto || "",
        telefoneCelular: telefoneMascarado,
        email: mappedBeneficiary.email || "",
        cpfCrnm: cpfMascarado,
        nif: mappedBeneficiary.nif || "",
        endereco: mappedBeneficiary.endereco || "",
        bairro: mappedBeneficiary.bairro || "",
        numero: mappedBeneficiary.numero || "",
        complemento: mappedBeneficiary.complemento || "",
        pontoReferencia: mappedBeneficiary.pontoReferencia || "",
        withdrawalLimit: mappedBeneficiary.withdrawalLimit || ""
      });
      setEditFormErrors({});
      setEditFieldErrors({});
      setEditingBeneficiary(mappedBeneficiary);
      setShowEditModal(true);
    } catch (err) {
      console.error("Erro ao carregar beneficiário:", err);
      showNotification(err.message || "Erro ao carregar beneficiário", "error");
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        try {
          await apiService.deleteBeneficiary(id);
          await loadDataRaw(); // Recarregar a lista após exclusão
          showNotification("Beneficiário excluído com sucesso!", "success");
        } catch (err) {
          console.error("Erro ao excluir beneficiário:", err);
          showNotification(err.message || "Erro ao excluir beneficiário", "error");
        }
      },
      message: "Tem certeza que deseja excluir este beneficiário?",
      title: "Confirmar Exclusão"
    });
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const user = authService.getUser();
      if (!user || !user.id) {
        showNotification("Erro: usuário não autenticado", "error");
        return;
      }
      await apiService.approveBeneficiary(id, "APPROVED", user.id);
      showNotification("Beneficiário aprovado com sucesso!", "success");
      loadDataRaw();
    } catch (err) {
      showNotification("Erro ao aprovar beneficiário", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        setApprovingId(id);
        try {
          const user = authService.getUser();
          if (!user || !user.id) {
            showNotification("Erro: usuário não autenticado", "error");
            return;
          }
          await apiService.approveBeneficiary(id, "REJECTED", user.id);
          showNotification("Beneficiário rejeitado com sucesso!", "success");
          loadDataRaw();
        } catch (err) {
          showNotification("Erro ao rejeitar beneficiário", "error");
        } finally {
          setApprovingId(null);
        }
      },
      message: "Tem certeza que deseja rejeitar este beneficiário?",
      title: "Confirmar Rejeição"
    });
  };

  const handleConfirm = async () => {
    if (confirmModal.action) {
      await confirmModal.action();
    }
    setConfirmModal({ isOpen: false, action: null, message: "", title: "" });
  };

  const handleAdd = () => {
    setFormData({
      nomeCompleto: "",
      telefoneCelular: "",
      email: "",
      cpfCrnm: "",
      nif: "",
      endereco: "",
      bairro: "",
      numero: "",
      complemento: "",
      pontoReferencia: "",
      withdrawalLimit: ""
    });
    setFormErrors({});
    setFieldErrors({});
    setShowAddModal(true);
  };

  const validateField = (name, value) => {
    let validation = { valid: true, message: "" };

    switch (name) {
      case "email":
        validation = validateEmail(value);
        break;
      case "telefoneCelular":
        validation = validatePhone(value);
        break;
      case "cpfCrnm":
        if (value) {
          validation = validateCPF(value);
        }
        break;
      case "nif":
        if (value && !/^\d+$/.test(value.replace(/\D/g, ""))) {
          validation = { valid: false, message: "NIF deve conter apenas números" };
        }
        break;
      default:
        validation = { valid: true };
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.valid ? "" : validation.message
    }));

    return validation.valid;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Aplica máscaras em tempo real
    if (name === "telefoneCelular") {
      processedValue = maskPhone(value);
    } else if (name === "cpfCrnm") {
      processedValue = maskCPF(value);
    }
    
    setFormData({ ...formData, [name]: processedValue });
    
    if (name === "email" || name === "telefoneCelular" || name === "cpfCrnm" || name === "nif") {
      if (processedValue.length > 0 || fieldErrors[name] !== undefined) {
        validateField(name, processedValue);
      }
    }
  };

  const handleFieldBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

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
    
    if (!formData.endereco.trim()) errors.endereco = "Endereço é obrigatório";
    if (!formData.bairro.trim()) errors.bairro = "Bairro é obrigatório";
    if (!formData.numero.trim()) errors.numero = "Número é obrigatório";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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
      setFormData({
        nomeCompleto: "",
        telefoneCelular: "",
        email: "",
        cpfCrnm: "",
        nif: "",
        endereco: "",
        bairro: "",
        numero: "",
        complemento: "",
        pontoReferencia: "",
        withdrawalLimit: ""
      });
      loadDataRaw();
    } catch (err) {
      console.error("Erro ao criar beneficiário:", err);
      showNotification(err.message || "Erro ao criar beneficiário", "error");
    }
  };

  const validateEditField = (name, value) => {
    let validation = { valid: true, message: "" };

    switch (name) {
      case "email":
        validation = validateEmail(value);
        break;
      case "telefoneCelular":
        validation = validatePhone(value);
        break;
      case "cpfCrnm":
        if (value) {
          validation = validateCPF(value);
        }
        break;
      case "nif":
        if (value && !/^\d+$/.test(value.replace(/\D/g, ""))) {
          validation = { valid: false, message: "NIF deve conter apenas números" };
        }
        break;
      default:
        validation = { valid: true };
    }

    setEditFieldErrors(prev => ({
      ...prev,
      [name]: validation.valid ? "" : validation.message
    }));

    return validation.valid;
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Aplica máscaras em tempo real
    if (name === "telefoneCelular") {
      processedValue = maskPhone(value);
    } else if (name === "cpfCrnm") {
      processedValue = maskCPF(value);
    }
    
    setEditFormData({ ...editFormData, [name]: processedValue });
    
    if (name === "email" || name === "telefoneCelular" || name === "cpfCrnm" || name === "nif") {
      if (processedValue.length > 0 || editFieldErrors[name] !== undefined) {
        validateEditField(name, processedValue);
      }
    }
  };

  const handleEditFieldBlur = (e) => {
    validateEditField(e.target.name, e.target.value);
  };

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
    
    if (!editFormData.endereco.trim()) errors.endereco = "Endereço é obrigatório";
    if (!editFormData.bairro.trim()) errors.bairro = "Bairro é obrigatório";
    if (!editFormData.numero.trim()) errors.numero = "Número é obrigatório";
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      const cpfCrnmLimpo = unmask(editFormData.cpfCrnm);
      const nifLimpo = unmask(editFormData.nif);
      const phoneValidation = validatePhone(editFormData.telefoneCelular);
      
      // Validação: pelo menos um dos campos (CPF/CRNM ou NIF) deve ser preenchido
      if (cpfCrnmLimpo.length === 0 && nifLimpo.length === 0) {
        showNotification("É obrigatório preencher pelo menos um dos campos: CPF/CRNM ou NIF.", "error");
        return;
      }
      
      // Validações usando as funções de validação
      if (!phoneValidation.valid) {
        showNotification(phoneValidation.message, "error");
        return;
      }

      // Preparar dados para o backend no formato esperado pelo update
      const beneficiaryData = {
        fullName: editFormData.nomeCompleto,
        cpf: cpfCrnmLimpo || nifLimpo,
        phone: phoneValidation.cleaned,
        socioeconomicData: JSON.stringify({
          endereco: editFormData.endereco,
          bairro: editFormData.bairro,
          numero: editFormData.numero,
          complemento: editFormData.complemento,
          pontoReferencia: editFormData.pontoReferencia,
        }),
        beneficiaryStatus: editingBeneficiary.status || 'PENDING',
        withdrawalLimit: editFormData.withdrawalLimit ? parseInt(editFormData.withdrawalLimit) : null
      };

      await apiService.updateBeneficiary(editingBeneficiary.id, beneficiaryData);
      showNotification("Beneficiário atualizado com sucesso!", "success");
      setShowEditModal(false);
      setEditingBeneficiary(null);
      loadDataRaw();
    } catch (err) {
      console.error("Erro ao atualizar beneficiário:", err);
      showNotification(err.message || "Erro ao atualizar beneficiário", "error");
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "APPROVED":
        return "Aprovado";
      case "REJECTED":
        return "Rejeitado";
      default:
        return status || "N/A";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return styles.statusPending;
      case "APPROVED":
        return styles.statusApproved;
      case "REJECTED":
        return styles.statusRejected;
      default:
        return "";
    }
  };

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>Beneficiários Cadastrados</h1>
          <div className={styles.decoracao}></div>
          <div className={styles.actionsHeader}>
            <button
              className={styles.addButton}
              onClick={handleAdd}
              title="Adicionar Novo Beneficiário"
            >
              <FaPlus />
            </button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.beneficiariosTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CRNM</th>
                  <th>Telefone</th>
                  <th>Status</th>
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
                ) : beneficiarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noDataMessage}>Nenhum beneficiário cadastrado ainda.</td>
                  </tr>
                ) : (
                  beneficiarios.map((b) => (
                    <tr key={b.id}>
                      <td>{b.nomeCompleto}</td>
                      <td>{b.cpfCrnm ? maskCPF(b.cpfCrnm) : (b.nif || '-')}</td>
                      <td>{b.telefoneCelular ? maskPhone(b.telefoneCelular) : '-'}</td>
                      <td>
                        <span className={getStatusClass(b.status)}>
                          {getStatusLabel(b.status)}
                        </span>
                      </td>
                      <td className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(b.id)}
                          disabled={loading}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        {isAdmin && b.status === "PENDING" && (
                          <>
                            <button
                              className={styles.approveButton}
                              onClick={() => handleApprove(b.id)}
                              disabled={loading || approvingId === b.id}
                              title="Aprovar Beneficiário"
                            >
                              <FaCheck />
                            </button>
                            <button
                              className={styles.rejectButton}
                              onClick={() => handleReject(b.id)}
                              disabled={loading || approvingId === b.id}
                              title="Rejeitar Beneficiário"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(b.id)}
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
      {/* Modal de Adicionar Beneficiário */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Criar Novo Beneficiário</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleFieldChange}
                  className={formErrors.nomeCompleto ? styles.inputError : ''}
                />
                {formErrors.nomeCompleto && <span className={styles.errorText}>{formErrors.nomeCompleto}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  className={formErrors.email || fieldErrors.email ? styles.inputError : ''}
                />
                {(formErrors.email || fieldErrors.email) && <span className={styles.errorText}>{formErrors.email || fieldErrors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="telefoneCelular"
                  value={formData.telefoneCelular}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  placeholder="(45) 9 9988-7766"
                  maxLength={15}
                  className={formErrors.telefoneCelular || fieldErrors.telefoneCelular ? styles.inputError : ''}
                />
                {(formErrors.telefoneCelular || fieldErrors.telefoneCelular) && <span className={styles.errorText}>{formErrors.telefoneCelular || fieldErrors.telefoneCelular}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>CPF/CRNM</label>
                <input
                  type="text"
                  name="cpfCrnm"
                  value={formData.cpfCrnm}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={formErrors.cpfCrnm || fieldErrors.cpfCrnm ? styles.inputError : ''}
                />
                {(formErrors.cpfCrnm || fieldErrors.cpfCrnm) && <span className={styles.errorText}>{formErrors.cpfCrnm || fieldErrors.cpfCrnm}</span>}
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                  Preencha CPF/CRNM ou NIF (pelo menos um é obrigatório)
                </small>
              </div>

              <div className={styles.formGroup}>
                <label>NIF</label>
                <input
                  type="text"
                  name="nif"
                  value={formData.nif}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, nif: onlyNums });
                    if (fieldErrors.nif !== undefined || onlyNums.length > 0) {
                      validateField("nif", onlyNums);
                    }
                  }}
                  onBlur={handleFieldBlur}
                  placeholder="123456789"
                  className={formErrors.nif || fieldErrors.nif ? styles.inputError : ''}
                />
                {(formErrors.nif || fieldErrors.nif) && <span className={styles.errorText}>{formErrors.nif || fieldErrors.nif}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleFieldChange}
                  className={formErrors.endereco ? styles.inputError : ''}
                />
                {formErrors.endereco && <span className={styles.errorText}>{formErrors.endereco}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Número *</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleFieldChange}
                  className={formErrors.numero ? styles.inputError : ''}
                />
                {formErrors.numero && <span className={styles.errorText}>{formErrors.numero}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleFieldChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleFieldChange}
                  className={formErrors.bairro ? styles.inputError : ''}
                />
                {formErrors.bairro && <span className={styles.errorText}>{formErrors.bairro}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Ponto de Referência</label>
                <input
                  type="text"
                  name="pontoReferencia"
                  value={formData.pontoReferencia}
                  onChange={handleFieldChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Limite de Retiradas Mensais (opcional)</label>
                <input
                  type="number"
                  name="withdrawalLimit"
                  min="0"
                  value={formData.withdrawalLimit}
                  onChange={handleFieldChange}
                  placeholder="Ex: 10"
                />
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                  Deixe em branco para usar o limite global do sistema
                </small>
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
                  disabled={loading}
                >
                  {loading ? "Criando..." : "Criar Beneficiário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Beneficiário */}
      {showEditModal && editingBeneficiary && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Editar Beneficiário</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={editFormData.nomeCompleto}
                  onChange={handleEditFieldChange}
                  className={editFormErrors.nomeCompleto ? styles.inputError : ''}
                />
                {editFormErrors.nomeCompleto && <span className={styles.errorText}>{editFormErrors.nomeCompleto}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFieldChange}
                  onBlur={handleEditFieldBlur}
                  className={editFormErrors.email || editFieldErrors.email ? styles.inputError : ''}
                />
                {(editFormErrors.email || editFieldErrors.email) && <span className={styles.errorText}>{editFormErrors.email || editFieldErrors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="telefoneCelular"
                  value={editFormData.telefoneCelular}
                  onChange={handleEditFieldChange}
                  onBlur={handleEditFieldBlur}
                  placeholder="(45) 9 9988-7766"
                  maxLength={15}
                  className={editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular ? styles.inputError : ''}
                />
                {(editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular) && <span className={styles.errorText}>{editFormErrors.telefoneCelular || editFieldErrors.telefoneCelular}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>CPF/CRNM</label>
                <input
                  type="text"
                  name="cpfCrnm"
                  value={editFormData.cpfCrnm}
                  onChange={handleEditFieldChange}
                  onBlur={handleEditFieldBlur}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={editFormErrors.cpfCrnm || editFieldErrors.cpfCrnm ? styles.inputError : ''}
                />
                {(editFormErrors.cpfCrnm || editFieldErrors.cpfCrnm) && <span className={styles.errorText}>{editFormErrors.cpfCrnm || editFieldErrors.cpfCrnm}</span>}
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                  Preencha CPF/CRNM ou NIF (pelo menos um é obrigatório)
                </small>
              </div>

              <div className={styles.formGroup}>
                <label>NIF</label>
                <input
                  type="text"
                  name="nif"
                  value={editFormData.nif}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    setEditFormData({ ...editFormData, nif: onlyNums });
                    if (editFieldErrors.nif !== undefined || onlyNums.length > 0) {
                      validateEditField("nif", onlyNums);
                    }
                  }}
                  onBlur={handleEditFieldBlur}
                  placeholder="123456789"
                  className={editFormErrors.nif || editFieldErrors.nif ? styles.inputError : ''}
                />
                {(editFormErrors.nif || editFieldErrors.nif) && <span className={styles.errorText}>{editFormErrors.nif || editFieldErrors.nif}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={editFormData.endereco}
                  onChange={handleEditFieldChange}
                  className={editFormErrors.endereco ? styles.inputError : ''}
                />
                {editFormErrors.endereco && <span className={styles.errorText}>{editFormErrors.endereco}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Número *</label>
                <input
                  type="text"
                  name="numero"
                  value={editFormData.numero}
                  onChange={handleEditFieldChange}
                  className={editFormErrors.numero ? styles.inputError : ''}
                />
                {editFormErrors.numero && <span className={styles.errorText}>{editFormErrors.numero}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={editFormData.complemento}
                  onChange={handleEditFieldChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  value={editFormData.bairro}
                  onChange={handleEditFieldChange}
                  className={editFormErrors.bairro ? styles.inputError : ''}
                />
                {editFormErrors.bairro && <span className={styles.errorText}>{editFormErrors.bairro}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Ponto de Referência</label>
                <input
                  type="text"
                  name="pontoReferencia"
                  value={editFormData.pontoReferencia}
                  onChange={handleEditFieldChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Limite de Retiradas Mensais (opcional)</label>
                <input
                  type="number"
                  name="withdrawalLimit"
                  min="0"
                  value={editFormData.withdrawalLimit}
                  onChange={handleEditFieldChange}
                  placeholder="Ex: 10"
                />
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                  Deixe em branco para usar o limite global do sistema
                </small>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBeneficiary(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
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