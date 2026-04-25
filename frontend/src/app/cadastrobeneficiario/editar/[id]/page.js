"use client";
import React, { useState, useEffect } from "react";
import MenuBar from "../../../components/menubar/menubar";
import Navigation from "../../../components/navegation/navegation";
import { useRouter, useParams } from "next/navigation";
import styles from "../../cadastrobeneficiario.module.css";
import apiService from "../../../../services/api";
import { mapBeneficiaryFromBackend } from "../../../../services/dataMapper";
import { useApi } from "../../../../hooks/useApi";
import { useNotification } from "../../../../components/notifications/NotificationProvider";
import { FaIdCard, FaPrint, FaPlus, FaHistory } from "react-icons/fa";
import { validateCPF, validateEmail, validatePhone } from "../../../../utils/validators";
import { maskCPF, maskPhone, unmask } from "../../../../utils/masks";

const EditarBeneficiario = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { loading, error, execute, clearError } = useApi();
  const { showNotification } = useNotification();
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("dados");
  const [card, setCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [form, setForm] = useState({
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
    status: "PENDING",
    withdrawalLimit: ""
  });

  useEffect(() => {
    const loadBeneficiary = async () => {
      try {
        setLoadingData(true);
        const beneficiary = await apiService.getBeneficiary(id);
        const mappedBeneficiary = mapBeneficiaryFromBackend(beneficiary);
        // Aplica máscaras nos valores carregados
        const telefoneMascarado = mappedBeneficiary.telefoneCelular 
          ? maskPhone(mappedBeneficiary.telefoneCelular) 
          : "";
        const cpfMascarado = mappedBeneficiary.cpfCrnm 
          ? maskCPF(mappedBeneficiary.cpfCrnm) 
          : "";
        
        setForm({
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
          status: mappedBeneficiary.status || "PENDING",
          withdrawalLimit: mappedBeneficiary.withdrawalLimit || "",
          currentWithdrawalsThisMonth: mappedBeneficiary.currentWithdrawalsThisMonth || 0
        });
      } catch (err) {
        console.error("Erro ao carregar beneficiário:", err);
        showNotification(err.message || "Erro ao carregar beneficiário", "error");
        setTimeout(() => router.push("/cadastrobeneficiario/lista"), 2000);
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      loadBeneficiary();
      loadCard();
    }
  }, [id, router]);

  const loadWithdrawals = async () => {
    try {
      setLoadingWithdrawals(true);
      const withdrawalsData = await apiService.getBeneficiaryWithdrawals(id);
      setWithdrawals(withdrawalsData || []);
    } catch (err) {
      console.error("Erro ao carregar histórico de retiradas:", err);
      setWithdrawals([]);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  useEffect(() => {
    if (id && activeTab === "historico") {
      loadWithdrawals();
    }
  }, [id, activeTab]);

  const loadCard = async () => {
    try {
      setLoadingCard(true);
      const cardData = await apiService.getCardByBeneficiaryId(id);
      setCard(cardData);
    } catch (err) {
      console.error("Erro ao carregar cartão:", err);
      setCard(null);
    } finally {
      setLoadingCard(false);
    }
  };

  const handleGenerateCard = async () => {
    try {
      setLoadingCard(true);
      await apiService.generateCardForBeneficiary(id);
      // Recarregar o cartão após gerar
      await loadCard();
      showNotification("Cartão gerado e baixado com sucesso!", "success");
    } catch (err) {
      showNotification(err.message || "Erro ao gerar cartão", "error");
    } finally {
      setLoadingCard(false);
    }
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
        // Validação básica de NIF (apenas números)
        if (value && !/^\d+$/.test(unmask(value))) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Aplica máscaras em tempo real
    if (name === "telefoneCelular") {
      processedValue = maskPhone(value);
    } else if (name === "cpfCrnm") {
      processedValue = maskCPF(value);
    }
    
    setForm({ ...form, [name]: processedValue });
    
    // Validação em tempo real
    if (name === "email" || name === "telefoneCelular" || name === "cpfCrnm" || name === "nif") {
      if (processedValue.length > 0 || fieldErrors[name] !== undefined) {
        validateField(name, processedValue);
      }
    }
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    
    // Valida todos os campos antes de submeter
    const emailValid = validateField("email", form.email);
    const phoneValid = validateField("telefoneCelular", form.telefoneCelular);
    
    const cpfCrnmLimpo = unmask(form.cpfCrnm);
    const nifLimpo = unmask(form.nif);
    
    let cpfValid = true;
    if (cpfCrnmLimpo.length > 0) {
      cpfValid = validateField("cpfCrnm", form.cpfCrnm);
    }
    
    // Validação: pelo menos um dos campos (CPF/CRNM ou NIF) deve ser preenchido
    if (cpfCrnmLimpo.length === 0 && nifLimpo.length === 0) {
      showNotification("É obrigatório preencher pelo menos um dos campos: CPF/CRNM ou NIF.", "error");
      return;
    }

    // Verifica se há erros de validação
    if (!emailValid || !phoneValid || !cpfValid) {
      showNotification("Por favor, corrija os erros nos campos antes de enviar.", "error");
      return;
    }

    try {
      // Preparar dados para o backend
      const phoneValidation = validatePhone(form.telefoneCelular);
      const phoneCleaned = phoneValidation.cleaned;
      
      const beneficiaryData = {
        fullName: form.nomeCompleto,
        cpf: cpfCrnmLimpo || nifLimpo,
        phone: phoneCleaned,
        socioeconomicData: JSON.stringify({
          endereco: form.endereco,
          bairro: form.bairro,
          numero: form.numero,
          complemento: form.complemento,
          pontoReferencia: form.pontoReferencia,
        }),
        beneficiaryStatus: form.status || 'PENDING',
        withdrawalLimit: form.withdrawalLimit ? parseInt(form.withdrawalLimit) : null
      };

      // Chama a API de atualização
      await execute(() => apiService.updateBeneficiary(id, beneficiaryData));
      
      showNotification("Beneficiário atualizado com sucesso!", "success");
      setTimeout(() => router.push("/cadastrobeneficiario/lista"), 1000);
    } catch (err) {
      showNotification(err.message || "Erro ao atualizar beneficiário", "error");
    }
  }

  if (loadingData) {
    return (
      <div className={styles.containerGeral}>
        <MenuBar />
        <Navigation />
        <div className={styles.formWrapper}>
          <div className={styles.formContainer}>
            <h1 className={styles.titulo}>Carregando...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.formWrapper}>
        <div className={styles.formContainer}>
          <h1 className={styles.titulo}>Editar Beneficiário</h1>
          <div className={styles.decoracao}></div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
            <button
              type="button"
              onClick={() => setActiveTab("dados")}
              style={{
                padding: '10px 20px',
                background: activeTab === "dados" ? '#4CAF50' : 'transparent',
                color: activeTab === "dados" ? '#fff' : '#333',
                border: 'none',
                borderBottom: activeTab === "dados" ? '3px solid #4CAF50' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Dados
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cartao")}
              style={{
                padding: '10px 20px',
                background: activeTab === "cartao" ? '#4CAF50' : 'transparent',
                color: activeTab === "cartao" ? '#fff' : '#333',
                border: 'none',
                borderBottom: activeTab === "cartao" ? '3px solid #4CAF50' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              <FaIdCard style={{ marginRight: '8px', display: 'inline' }} />
              Cartão
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("historico")}
              style={{
                padding: '10px 20px',
                background: activeTab === "historico" ? '#4CAF50' : 'transparent',
                color: activeTab === "historico" ? '#fff' : '#333',
                border: 'none',
                borderBottom: activeTab === "historico" ? '3px solid #4CAF50' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              <FaHistory style={{ marginRight: '8px', display: 'inline' }} />
              Histórico
            </button>
          </div>

          {activeTab === "dados" && (
            <form onSubmit={handleSubmit} className={styles.formulario}>
            {/* Linha Nome e E-mail */}
            <div className={styles.formGroup}>
              <label htmlFor="nomeCompleto"><b>Nome completo*</b></label>
              <input 
                id="nomeCompleto"
                name="nomeCompleto" 
                value={form.nomeCompleto} 
                onChange={handleChange} 
                required 
                placeholder="Fulano da Silva" 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email"><b>E-mail*</b></label>
              <input 
                id="email"
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange}
                onBlur={handleBlur}
                required 
                placeholder="fulano@gmail.com"
                className={fieldErrors.email ? styles.inputError : ""}
              />
              {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
            </div>

            {/* Linha Telefone, CPF/CRNM, NIF */}
            <div className={styles.formGroup}>
              <label htmlFor="telefoneCelular"><b>Telefone*</b></label>
              <input 
                id="telefoneCelular"
                name="telefoneCelular" 
                value={form.telefoneCelular} 
                onChange={handleChange}
                onBlur={handleBlur}
                required 
                placeholder="(45) 9 9988-7766" 
                type="tel"
                maxLength={15}
                className={fieldErrors.telefoneCelular ? styles.inputError : ""}
              />
              {fieldErrors.telefoneCelular && <span className={styles.fieldError}>{fieldErrors.telefoneCelular}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="cpfCrnm"><b>CPF/CRNM (opcional se NIF for preenchido)</b></label>
              <input 
                id="cpfCrnm"
                name="cpfCrnm" 
                type="text" 
                value={form.cpfCrnm} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="000.000.000-00"
                maxLength={14}
                className={fieldErrors.cpfCrnm ? styles.inputError : ""}
              />
              {fieldErrors.cpfCrnm && <span className={styles.fieldError}>{fieldErrors.cpfCrnm}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="nif"><b>NIF (opcional se CPF/CRNM for preenchido)</b></label>
              <input 
                id="nif"
                name="nif" 
                type="text" 
                value={form.nif} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="123456789"
                className={fieldErrors.nif ? styles.inputError : ""}
              />
              {fieldErrors.nif && <span className={styles.fieldError}>{fieldErrors.nif}</span>}
            </div>

            <hr className={styles.separador} />

            {/* Linha Endereço, Número, Complemento */}
            <div className={styles.formGroupFullWidth}>
              <label htmlFor="endereco"><b>Endereço*</b></label>
              <input 
                id="endereco"
                name="endereco" 
                value={form.endereco} 
                onChange={handleChange} 
                required 
                placeholder="Rua da Água" 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="numero"><b>Número*</b></label>
              <input 
                id="numero"
                name="numero" 
                type="number" 
                value={form.numero} 
                onChange={handleChange} 
                required 
                placeholder="2015" 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="complemento"><b>Complemento</b></label>
              <input 
                id="complemento"
                name="complemento" 
                value={form.complemento} 
                onChange={handleChange} 
                placeholder="Ap 307" 
              />
            </div>

            {/* Linha Bairro, Ponto de Referência */}
            <div className={styles.formGroupFullWidth}>
              <label htmlFor="bairro"><b>Bairro*</b></label>
              <input 
                id="bairro"
                name="bairro" 
                value={form.bairro} 
                onChange={handleChange} 
                required 
                placeholder="Centro" 
              />
            </div>
            <div className={styles.formGroupFullWidth}>
              <label htmlFor="pontoReferencia"><b>Ponto de referência</b></label>
              <input 
                id="pontoReferencia"
                name="pontoReferencia" 
                value={form.pontoReferencia} 
                onChange={handleChange} 
                placeholder="Em frente ao parque" 
              />
            </div>

            <hr className={styles.separador} />

            <div className={styles.formGroup}>
              <label htmlFor="withdrawalLimit"><b>Limite de Retiradas Mensais (opcional)</b></label>
              <input
                id="withdrawalLimit"
                name="withdrawalLimit"
                type="number"
                min="0"
                value={form.withdrawalLimit}
                onChange={e => {
                  const value = e.target.value === "" ? "" : parseInt(e.target.value) || 0;
                  setForm({ ...form, withdrawalLimit: value });
                }}
                placeholder="Ex: 10"
              />
              <small style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginTop: '5px' }}>
                Deixe em branco para usar o limite global do sistema
                {form.currentWithdrawalsThisMonth !== undefined && form.withdrawalLimit && (
                  <span style={{ display: 'block', marginTop: '5px', fontWeight: 'bold', color: '#4CAF50' }}>
                    Retiradas este mês: {form.currentWithdrawalsThisMonth || 0}/{form.withdrawalLimit}
                  </span>
                )}
              </small>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => router.push("/cadastrobeneficiario/lista")}
                style={{ 
                  background: '#aaa', 
                  color: '#fff',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </form>
          )}

          {activeTab === "cartao" && (
            <div style={{ padding: '20px' }}>
              {loadingCard ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Carregando informações do cartão...</div>
              ) : card ? (
                <div style={{ 
                  border: '2px solid #4CAF50', 
                  borderRadius: '12px', 
                  padding: '30px',
                  background: '#f9f9f9'
                }}>
                  <h2 style={{ marginBottom: '20px', color: '#4CAF50' }}>Informações do Cartão</h2>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Número do Cartão:</strong>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px', color: '#333' }}>
                      {card.uniqueNumber}
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Data de Emissão:</strong>
                    <div style={{ marginTop: '5px', color: '#666' }}>
                      {card.issueDate ? new Date(card.issueDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: '12px', 
                  padding: '40px',
                  textAlign: 'center',
                  background: '#f9f9f9'
                }}>
                  <FaIdCard style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }} />
                  <h3 style={{ marginBottom: '10px' }}>Nenhum cartão encontrado</h3>
                  <p style={{ color: '#666', marginBottom: '30px' }}>
                    Este beneficiário ainda não possui um cartão de identificação.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateCard}
                    disabled={loadingCard}
                    style={{
                      background: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: loadingCard ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    <FaPlus /> {loadingCard ? 'Gerando...' : 'Gerar Cartão'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "historico" && (
            <div style={{ padding: '20px' }}>
              {loadingWithdrawals ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Carregando histórico...</div>
              ) : withdrawals.length === 0 ? (
                <div style={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: '12px', 
                  padding: '40px',
                  textAlign: 'center',
                  background: '#f9f9f9'
                }}>
                  <FaHistory style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }} />
                  <h3 style={{ marginBottom: '10px' }}>Nenhuma retirada registrada</h3>
                  <p style={{ color: '#666' }}>
                    Este beneficiário ainda não possui retiradas registradas.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#4CAF50' }}>Histórico de Retiradas</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                      <thead>
                        <tr style={{ background: '#4CAF50', color: '#fff' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Data</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Atendente</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Itens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((withdrawal, index) => (
                          <tr key={withdrawal.withdrawalId || index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                            <td style={{ padding: '12px' }}>
                              {withdrawal.withdrawalDate 
                                ? new Date(withdrawal.withdrawalDate).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'N/A'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {withdrawal.attendantUser?.name || 'N/A'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {withdrawal.items?.length > 0 
                                ? withdrawal.items.map(item => `${item.item?.description || 'Item'} (${item.quantity})`).join(', ')
                                : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarBeneficiario;

