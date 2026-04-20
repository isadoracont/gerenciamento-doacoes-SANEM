/**
 * Utilitários para aplicar máscaras em campos de input
 */

/**
 * Aplica máscara de CPF (000.000.000-00)
 * @param {string} value - Valor a ser mascarado
 * @returns {string} - Valor com máscara aplicada
 */
export const maskCPF = (value) => {
  if (!value) return "";
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9, 11)}`;
  }
};

/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 * @param {string} value - Valor a ser mascarado
 * @returns {string} - Valor com máscara aplicada
 */
export const maskCNPJ = (value) => {
  if (!value) return "";
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Limita a 14 dígitos
  const limited = numbers.slice(0, 14);
  
  // Aplica a máscara
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  } else if (limited.length <= 12) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  } else {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12, 14)}`;
  }
};

/**
 * Aplica máscara de CPF ou CNPJ automaticamente baseado no tamanho
 * @param {string} value - Valor a ser mascarado
 * @returns {string} - Valor com máscara aplicada
 */
export const maskCPForCNPJ = (value) => {
  if (!value) return "";
  
  const numbers = value.replace(/\D/g, "");
  
  // Se tem 11 dígitos ou menos, aplica máscara de CPF
  if (numbers.length <= 11) {
    return maskCPF(value);
  } else {
    // Se tem mais de 11 dígitos, aplica máscara de CNPJ
    return maskCNPJ(value);
  }
};

/**
 * Aplica máscara de telefone brasileiro ((00) 0 0000-0000 ou (00) 00000-0000)
 * @param {string} value - Valor a ser mascarado
 * @returns {string} - Valor com máscara aplicada
 */
export const maskPhone = (value) => {
  if (!value) return "";
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara baseado no tamanho
  if (limited.length === 0) {
    return "";
  } else if (limited.length <= 2) {
    return `(${limited}`;
  } else if (limited.length <= 6) {
    // Telefone fixo: (00) 0000
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else {
    // Celular: (00) 0 0000-0000
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 3)} ${limited.slice(3, 7)}-${limited.slice(7, 11)}`;
  }
};

/**
 * Remove máscara de um valor (retorna apenas números)
 * @param {string} value - Valor com máscara
 * @returns {string} - Valor sem máscara (apenas números)
 */
export const unmask = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

/**
 * Aplica máscara de CEP (00000-000)
 * @param {string} value - Valor a ser mascarado
 * @returns {string} - Valor com máscara aplicada
 */
export const maskCEP = (value) => {
  if (!value) return "";
  
  const numbers = value.replace(/\D/g, "");
  const limited = numbers.slice(0, 8);
  
  if (limited.length <= 5) {
    return limited;
  } else {
    return `${limited.slice(0, 5)}-${limited.slice(5, 8)}`;
  }
};

