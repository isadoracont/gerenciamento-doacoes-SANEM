"use client";
import React, { useState } from "react";
import MenuBar from "../components/menubar/menubar";
import Navegation from "../components/navegation/navegation";
import { useRouter } from "next/navigation";
import styles from "./cadastrodoador.module.css";
import apiService from "../../services/api";
import { mapDonorToBackend } from "../../services/dataMapper";
import { useApi } from "../../hooks/useApi";
import { useNotification } from "../../components/notifications/NotificationProvider";
import { validateCPForCNPJ, validateEmail, validatePhone } from "../../utils/validators";
import { maskCPForCNPJ, maskPhone, unmask } from "../../utils/masks";

const CadastroDoador = () => {
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
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();
  const { loading, error, execute, clearError } = useApi();
  const { showNotification } = useNotification();

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
    
    // Validação em tempo real para campos críticos (email, telefone, CPF) assim que começam a digitar
    if (name === "email" || name === "telefoneCelular" || name === "cpf") {
      if (processedValue.length > 0 || fieldErrors[name] !== undefined) {
        validateField(name, processedValue);
      }
    } else if (fieldErrors[name] !== undefined || processedValue.length > 0) {
      validateField(name, processedValue);
    }
  };

  const handleBlur = (e) => {
    // Valida quando o usuário sai do campo
    validateField(e.target.name, e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();

    // Valida todos os campos antes de submeter
    const emailValid = validateField("email", form.email);
    const phoneValid = validateField("telefoneCelular", form.telefoneCelular);
    const cpfValid = validateField("cpf", form.cpf);

    // Obter dados validados para envio
    const cpfCnpjValidation = validateCPForCNPJ(form.cpf);
    const phoneValidation = validatePhone(form.telefoneCelular);

    // Verifica se há erros de validação
    if (!emailValid || !phoneValid || !cpfValid) {
      showNotification("Por favor, corrija os erros nos campos antes de enviar.", "error");
      return;
    }

    try {
      // Prepara dados para o backend
      const donorData = mapDonorToBackend({
        ...form,
        cpf: cpfCnpjValidation.cleaned,
        telefoneCelular: phoneValidation.cleaned
      });

      // Chama a API
      await execute(() => apiService.createDonor(donorData));

      // Limpa o formulário
      setForm({
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
      
      showNotification("Doador cadastrado com sucesso!", "success");
      setTimeout(() => router.push("/sucesso?tipo=doadores"), 1000);
    } catch (err) {
      showNotification(err.message || "Erro ao cadastrar doador", "error");
    }
  }

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navegation />
      <div className={styles.formWrapper}>
        <div className={styles.formContainer}>
          <h1 className={styles.titulo}>Cadastro de Doador</h1>
          <div className={styles.decoracao}></div>
          <form onSubmit={handleSubmit} className={styles.formulario}>
            <div className={styles.formGroup}>
              <label htmlFor="nomeCompleto"><b>Nome completo*</b></label>
              <input id="nomeCompleto" name="nomeCompleto" value={form.nomeCompleto} onChange={handleChange} required placeholder="Fulano da Silva" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email"><b>E-mail*</b></label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} required placeholder="fulano@gmail.com" className={fieldErrors.email ? styles.inputError : ""} />
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
              <input id="endereco" name="endereco" value={form.endereco} onChange={handleChange} required placeholder="Rua da Água" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="numero"><b>Número*</b></label>
              <input id="numero" name="numero" type="number" value={form.numero} onChange={handleChange} required placeholder="2015" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="complemento"><b>Complemento</b></label>
              <input id="complemento" name="complemento" value={form.complemento} onChange={handleChange} placeholder="Ap 307" />
            </div>
            <div className={styles.formGroupFullWidth}>
              <label htmlFor="bairro"><b>Bairro*</b></label>
              <input id="bairro" name="bairro" value={form.bairro} onChange={handleChange} required placeholder="Centro" />
            </div>
            <div className={styles.formGroupFullWidth}>
              <label htmlFor="pontoReferencia"><b>Ponto de referência</b></label>
              <input id="pontoReferencia" name="pontoReferencia" value={form.pontoReferencia} onChange={handleChange} placeholder="Em frente ao parque" />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Doador"}
            </button>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroDoador; 