"use client";
import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import styles from "./lista.module.css";
import { useRouter } from "next/navigation";
import apiService from "../../../services/api";
import { mapDonorFromBackend } from "../../../services/dataMapper";
import { useApiList } from "../../../hooks/useApi";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNotification } from "../../../components/notifications/NotificationProvider";
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal";
import { validateCPForCNPJ, validateEmail, validatePhone } from "../../../utils/validators";
import { mapDonorToBackend } from "../../../services/dataMapper";
import { maskCPForCNPJ, maskPhone, unmask } from "../../../utils/masks";

export default function ListaDoadores() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: "", title: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    telefoneCelular: "",
    email: "",
    cpf: "",
    endereco: "",
    bairro: "",
    numero: "",
    complemento: "",
    pontoReferencia: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nomeCompleto: "",
    telefoneCelular: "",
    email: "",
    cpf: "",
    endereco: "",
    bairro: "",
    numero: "",
    complemento: "",
    pontoReferencia: ""
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editingDonor, setEditingDonor] = useState(null);

  const {
    data: doadoresRaw,
    loading,
    error,
    loadData: loadDataRaw,
    removeItem,
    clearError
  } = useApiList((filters) => apiService.getDonors(filters));

  const doadores = Array.isArray(doadoresRaw)
    ? doadoresRaw.map(mapDonorFromBackend)
    : [];

  useEffect(() => {
    loadDataRaw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = async (id) => {
    try {
      const donor = await apiService.getDonor(id);
      const mappedDonor = mapDonorFromBackend(donor);
      // Aplica máscaras nos valores carregados
      const telefoneMascarado = mappedDonor.telefoneCelular 
        ? maskPhone(mappedDonor.telefoneCelular) 
        : "";
      const cpfMascarado = mappedDonor.cpf 
        ? maskCPForCNPJ(mappedDonor.cpf) 
        : "";
      
      setEditFormData({
        nomeCompleto: mappedDonor.nomeCompleto || "",
        telefoneCelular: telefoneMascarado,
        email: mappedDonor.email || "",
        cpf: cpfMascarado,
        endereco: mappedDonor.endereco || "",
        bairro: mappedDonor.bairro || "",
        numero: mappedDonor.numero || "",
        complemento: mappedDonor.complemento || "",
        pontoReferencia: mappedDonor.pontoReferencia || ""
      });
      setEditFormErrors({});
      setEditFieldErrors({});
      setEditingDonor(mappedDonor);
      setShowEditModal(true);
    } catch (err) {
      console.error("Erro ao carregar doador:", err);
      showNotification(err.message || "Erro ao carregar doador", "error");
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      action: async () => {
        try {
          await apiService.deleteDonor(id);
          await loadDataRaw(); // Recarregar a lista após exclusão
          showNotification("Doador excluído com sucesso!", "success");
        } catch (err) {
          console.error("Erro ao excluir doador:", err);
          showNotification(err.message || "Erro ao excluir doador", "error");
        }
      },
      message: "Tem certeza que deseja excluir este doador?",
      title: "Confirmar Exclusão"
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
      cpf: "",
      endereco: "",
      bairro: "",
      numero: "",
      complemento: "",
      pontoReferencia: ""
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
      case "cpf":
        if (value) {
          validation = validateCPForCNPJ(value);
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
    } else if (name === "cpf") {
      processedValue = maskCPForCNPJ(value);
    }
    
    setFormData({ ...formData, [name]: processedValue });
    
    if (name === "email" || name === "telefoneCelular" || name === "cpf") {
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
    if (!formData.cpf.trim()) errors.cpf = "CPF/CNPJ é obrigatório";
    else if (!validateCPForCNPJ(formData.cpf).valid) errors.cpf = validateCPForCNPJ(formData.cpf).message;
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
      setFormData({
        nomeCompleto: "",
        telefoneCelular: "",
        email: "",
        cpf: "",
        endereco: "",
        bairro: "",
        numero: "",
        complemento: "",
        pontoReferencia: ""
      });
      loadDataRaw();
    } catch (err) {
      console.error("Erro ao criar doador:", err);
      showNotification(err.message || "Erro ao criar doador", "error");
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
      case "cpf":
        if (value) {
          validation = validateCPForCNPJ(value);
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
    } else if (name === "cpf") {
      processedValue = maskCPForCNPJ(value);
    }
    
    setEditFormData({ ...editFormData, [name]: processedValue });
    
    if (name === "email" || name === "telefoneCelular" || name === "cpf") {
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
    if (!editFormData.cpf.trim()) errors.cpf = "CPF/CNPJ é obrigatório";
    else if (!validateCPForCNPJ(editFormData.cpf).valid) errors.cpf = validateCPForCNPJ(editFormData.cpf).message;
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
      console.error("Erro ao atualizar doador:", err);
      showNotification(err.message || "Erro ao atualizar doador", "error");
    }
  };

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>Doadores Cadastrados</h1>
          <div className={styles.decoracao}></div>
          <div className={styles.actionsHeader}>
            <button
              className={styles.addButton}
              onClick={handleAdd}
              title="Adicionar Novo Doador"
            >
              <FaPlus />
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
                    <td colSpan={5} className={styles.noDataMessage}>Nenhum doador cadastrado ainda.</td>
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
                <label>CPF/CNPJ *</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                  className={formErrors.cpf || fieldErrors.cpf ? styles.inputError : ''}
                />
                {(formErrors.cpf || fieldErrors.cpf) && <span className={styles.errorText}>{formErrors.cpf || fieldErrors.cpf}</span>}
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
                  {loading ? "Criando..." : "Criar Doador"}
                </button>
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
                <label>CPF/CNPJ *</label>
                <input
                  type="text"
                  name="cpf"
                  value={editFormData.cpf}
                  onChange={handleEditFieldChange}
                  onBlur={handleEditFieldBlur}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                  className={editFormErrors.cpf || editFieldErrors.cpf ? styles.inputError : ''}
                />
                {(editFormErrors.cpf || editFieldErrors.cpf) && <span className={styles.errorText}>{editFormErrors.cpf || editFieldErrors.cpf}</span>}
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

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDonor(null);
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