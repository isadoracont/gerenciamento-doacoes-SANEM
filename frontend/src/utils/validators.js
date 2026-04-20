// Validação de CPF
export const validateCPF = (cpf) => {
  if (!cpf) return { valid: false, message: "CPF é obrigatório" };

  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) {
    return { valid: false, message: "CPF deve conter 11 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, message: "CPF inválido (números repetidos)" };
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return { valid: false, message: "CPF inválido" };
  }

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return { valid: false, message: "CPF inválido" };
  }

  return { valid: true, cleaned };
};

// Validação de CNPJ
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return { valid: false, message: "CNPJ é obrigatório" };

  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, "");

  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) {
    return { valid: false, message: "CNPJ deve conter 14 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return { valid: false, message: "CNPJ inválido (números repetidos)" };
  }

  // Validação dos dígitos verificadores
  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;

  // Valida primeiro dígito verificador
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return { valid: false, message: "CNPJ inválido" };
  }

  // Valida segundo dígito verificador
  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return { valid: false, message: "CNPJ inválido" };
  }

  return { valid: true, cleaned };
};

// Validação de CPF ou CNPJ
export const validateCPForCNPJ = (value) => {
  if (!value) return { valid: false, message: "CPF/CNPJ é obrigatório" };

  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return validateCPF(value);
  } else if (cleaned.length === 14) {
    return validateCNPJ(value);
  } else {
    return { valid: false, message: "CPF deve conter 11 dígitos ou CNPJ deve conter 14 dígitos" };
  }
};

// Validação de email
export const validateEmail = (email) => {
  if (!email) return { valid: false, message: "Email é obrigatório" };

  // Regex mais robusta para validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Email deve ter um formato válido (ex: usuario@exemplo.com)" };
  }

  // Validações adicionais
  if (email.length > 255) {
    return { valid: false, message: "Email não pode ter mais de 255 caracteres" };
  }

  const parts = email.split("@");
  if (parts[0].length > 64) {
    return { valid: false, message: "Parte local do email (antes do @) não pode ter mais de 64 caracteres" };
  }

  return { valid: true };
};

// Validação de telefone
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: "Telefone é obrigatório" };

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length < 10 || cleaned.length > 11) {
    return { valid: false, message: "Telefone deve conter 10 ou 11 dígitos (incluindo DDD)" };
  }

  // Validação adicional: DDD deve estar entre 11 e 99
  const ddd = cleaned.slice(0, 2);
  if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
    return { valid: false, message: "DDD inválido" };
  }

  return { valid: true, cleaned };
};

