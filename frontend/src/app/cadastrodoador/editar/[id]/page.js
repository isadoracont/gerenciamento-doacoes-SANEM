"use client";
import React, { useState, useEffect } from "react";
import MenuBar from "../../../components/menubar/menubar";
import Navigation from "../../../components/navegation/navegation";
import { useRouter, useParams } from "next/navigation";
import styles from "../../cadastrodoador.module.css";
import apiService from "../../../../services/api";
import { mapDonorFromBackend, mapDonorToBackend } from "../../../../services/dataMapper";
import { useApi } from "../../../../hooks/useApi";
import { useNotification } from "../../../../components/notifications/NotificationProvider";
import { validateCPForCNPJ, validateEmail, validatePhone } from "../../../../utils/validators";
import { maskCPForCNPJ, maskPhone, unmask } from "../../../../utils/masks";

const EditarDoador = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { loading, error, execute, clearError } = useApi();
  const { showNotification } = useNotification();
  const [loadingData, setLoadingData] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [form, setForm] = useState({
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

  useEffect(() => {
    const loadDonor = async () => {
      try {
        setLoadingData(true);
        const donor = await apiService.getDonor(id);
        const mappedDonor = mapDonorFromBackend(donor);
        // Aplica máscaras nos valores carregados
        const telefoneMascarado = mappedDonor.telefoneCelular 
          ? maskPhone(mappedDonor.telefoneCelular) 
          : "";
        const cpfMascarado = mappedDonor.cpf 
          ? maskCPForCNPJ(mappedDonor.cpf) 
          : "";
        
        setForm({
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
      } catch (err) {
        console.error("Erro ao carregar doador:", err);
        showNotification(err.message || "Erro ao carregar doador", "error");
        setTimeout(() => router.push("/cadastrodoador/lista"), 2000);
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      loadDonor();
    }
  }, [id, router]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Aplica máscaras em tempo real
    if (name === "telefoneCelular") {
      processedValue = maskPhone(value);
    } else if (name === "cpf") {
      processedValue = maskCPForCNPJ(value);
    }
    
    setForm({ ...form, [name]: processedValue });
    
    // Validação em tempo real
    if (name === "email" || name === "telefoneCelular" || name === "cpf") {
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
    setValidationError("");
    
    // Valida todos os campos antes de submeter
    const emailValid = validateField("email", form.email);
    const phoneValid = validateField("telefoneCelular", form.telefoneCelular);
    const cpfValid = validateField("cpf", form.cpf);
    
    // Limpa o CPF para garantir que só vai número
    const cpfLimpo = unmask(form.cpf);
    
    // Verifica se há erros de validação
    if (!emailValid || !phoneValid || !cpfValid) {
      showNotification("Por favor, corrija os erros nos campos antes de enviar.", "error");
      return;
    }

    try {
      // Prepara dados para o backend
      const phoneValidation = validatePhone(form.telefoneCelular);
      const cpfCnpjValidation = validateCPForCNPJ(form.cpf);
      
      const donorData = mapDonorToBackend({
        ...form,
        cpf: cpfCnpjValidation.cleaned,
        telefoneCelular: phoneValidation.cleaned
      });

      // Chama a API de atualização
      await execute(() => apiService.updateDonor(id, donorData));
      
      showNotification("Doador atualizado com sucesso!", "success");
      setTimeout(() => router.push("/cadastrodoador/lista"), 1000);
    } catch (err) {
      showNotification(err.message || "Erro ao atualizar doador", "error");
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
          <h1 className={styles.titulo}>Editar Doador</h1>
          <div className={styles.decoracao}></div>
          <form onSubmit={handleSubmit} className={styles.formulario}>
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
              <label htmlFor="cpf"><b>CPF/CNPJ*</b></label>
              <input 
                id="cpf" 
                name="cpf" 
                type="text" 
                value={form.cpf} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
                required
                className={fieldErrors.cpf ? styles.inputError : ""}
              />
              {fieldErrors.cpf && <span className={styles.fieldError}>{fieldErrors.cpf}</span>}
            </div>
            <hr className={styles.separador} />
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
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => router.push("/cadastrodoador/lista")}
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
            {validationError && <div className={styles.errorMessage}>{validationError}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarDoador;

