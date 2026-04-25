// Mapeador de dados entre frontend e backend
export const mapDonorToBackend = (frontendDonor) => {
  return {
    name: frontendDonor.nomeCompleto,
    cpfCnpj: frontendDonor.cpf,
    contact: frontendDonor.email, // Contact deve ser email conforme validação do backend
  };
};

export const mapDonorFromBackend = (backendDonor) => {
  return {
    id: backendDonor.donorId,
    nomeCompleto: backendDonor.name,
    cpf: backendDonor.cpfCnpj,
    telefoneCelular: backendDonor.contact,
    email: backendDonor.contact, // Assumindo que contact pode ser email
    endereco: '', // Campos não disponíveis no backend atual
    bairro: '',
    numero: '',
    complemento: '',
    pontoReferencia: '',
  };
};

export const mapItemToBackend = (frontendItem) => {
  return {
    description: frontendItem.nome || frontendItem.descricao || '',
    stockQuantity: frontendItem.quantidade || 0,
    tagCode: frontendItem.tagCode || null
  };
};

export const mapItemFromBackend = (backendItem) => {
  return {
    id: backendItem.itemId,
    nome: backendItem.description,
    descricao: backendItem.description,
    quantidade: backendItem.stockQuantity,
    tagCode: backendItem.tagCode || null,
  };
};

export const mapUserToBackend = (frontendUser) => {
  return {
    name: frontendUser.nomeCompleto,
    login: frontendUser.login,
    email: frontendUser.email,
    password: frontendUser.senha,
    profileId: frontendUser.perfilId ? parseInt(frontendUser.perfilId) : 1, // Default profile
  };
};

export const mapUserFromBackend = (backendUser) => {
  return {
    id: backendUser.userId,
    nomeCompleto: backendUser.name,
    email: backendUser.email,
    login: backendUser.login || backendUser.email,
    perfil: backendUser.profile?.name || '',
    perfilId: backendUser.profile?.profileId || null,
    status: backendUser.status || 'ACTIVE',
  };
};

// Mapeador para Beneficiários (quando o controller for criado)
export const mapBeneficiaryToBackend = (frontendBeneficiary) => {
  // CPF pode ser vazio se NIF foi preenchido, mas não pode ser ambos vazios (validação já feita no frontend)
  const cpfValue = frontendBeneficiary.cpfCrnm || (frontendBeneficiary.nif ? "" : null);

  return {
    fullName: frontendBeneficiary.nomeCompleto,
    cpf: cpfValue || "", // Se não tem CPF mas tem NIF, envia string vazia
    phone: frontendBeneficiary.telefoneCelular, // Já vem limpo (apenas números) do frontend
    socioeconomicData: JSON.stringify({
      endereco: frontendBeneficiary.endereco,
      bairro: frontendBeneficiary.bairro,
      numero: frontendBeneficiary.numero,
      complemento: frontendBeneficiary.complemento,
      pontoReferencia: frontendBeneficiary.pontoReferencia,
    }),
    beneficiaryStatus: 'PENDING', // Status padrão
    withdrawalLimit: frontendBeneficiary.withdrawalLimit ? parseInt(frontendBeneficiary.withdrawalLimit) : null,
  };
};

export const mapBeneficiaryFromBackend = (backendBeneficiary) => {
  let socioeconomicData = {};
  try {
    socioeconomicData = JSON.parse(backendBeneficiary.socioeconomicData || '{}');
  } catch (e) {
    console.warn('Erro ao parsear socioeconomicData:', e);
  }

  return {
    id: backendBeneficiary.beneficiaryId,
    nomeCompleto: backendBeneficiary.fullName,
    cpfCrnm: backendBeneficiary.cpf,
    nif: '', // Campo não disponível no backend atual
    telefoneCelular: backendBeneficiary.phone,
    email: '', // Campo não disponível no backend atual
    withdrawalLimit: backendBeneficiary.withdrawalLimit || '',
    currentWithdrawalsThisMonth: backendBeneficiary.currentWithdrawalsThisMonth || 0,
    endereco: socioeconomicData.endereco || '',
    bairro: socioeconomicData.bairro || '',
    numero: socioeconomicData.numero || '',
    complemento: socioeconomicData.complemento || '',
    pontoReferencia: socioeconomicData.pontoReferencia || '',
    status: backendBeneficiary.beneficiaryStatus,
  };
};

// Mapeador para Voluntários (usando User com profile específico)
export const mapVolunteerToBackend = (frontendVolunteer) => {
  return {
    name: frontendVolunteer.nomeCompleto,
    email: frontendVolunteer.email,
    password: 'volunteer123', // Senha padrão para voluntários
    profileId: 2, // Assumindo que profile 2 é para voluntários
  };
};

export const mapVolunteerFromBackend = (backendUser) => {
  return {
    id: backendUser.userId,
    nomeCompleto: backendUser.name,
    email: backendUser.email,
    telefoneCelular: '', // Campo não disponível no backend atual
    cpf: '', // Campo não disponível no backend atual
    endereco: '',
    bairro: '',
    numero: '',
    complemento: '',
    pontoReferencia: '',
  };
};
