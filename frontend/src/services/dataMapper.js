// Mapeador de dados entre frontend e backend
export const mapDonorToBackend = (frontendDonor) => {
    return {
        name: frontendDonor.nomeCompleto,
        cpfCnpj: frontendDonor.cpf,
        contact: frontendDonor.telefoneCelular, // Usando telefone como contato obrigatório do back-end
        email: frontendDonor.email || null
    }
}

export const mapDonorFromBackend = (backendDonor) => {
    return {
        id: backendDonor.donorId,
        nomeCompleto: backendDonor.name,
        cpf: backendDonor.cpfCnpj,
        telefoneCelular: backendDonor.contact,
        email: backendDonor.email, // Assumindo que contact pode ser email
    }
}

export const mapItemToBackend = (frontendItem) => {
    return {
        description: frontendItem.nome || frontendItem.descricao || "",
        stockQuantity: frontendItem.quantidade || 0,
        tagCode: frontendItem.tagCode || null
    }
}

export const mapItemFromBackend = (backendItem) => {
    return {
        id: backendItem.itemId,
        nome: backendItem.description,
        descricao: backendItem.description,
        quantidade: backendItem.stockQuantity,
        tagCode: backendItem.tagCode || null
    }
}

export const mapDonationFromBackend = (backendDonation) => {
    return {
        id: backendDonation.donationId,
        donationDate: backendDonation.donationDate,
        donor: backendDonation.donor,
        receiverUser: backendDonation.receiverUser,
        items: (backendDonation.items || []).map((doado) => ({
            ...doado,
            nome: doado.item?.description || "Item"
        }))
    }
}

export const mapUserToBackend = (frontendUser) => {
    return {
        name: frontendUser.nomeCompleto,
        login: frontendUser.login,
        email: frontendUser.email,
        password: frontendUser.senha,
        profileId: frontendUser.perfilId ? parseInt(frontendUser.perfilId) : 1 // Default profile
    }
}

export const mapUserFromBackend = (backendUser) => {
    return {
        id: backendUser.userId,
        nomeCompleto: backendUser.name,
        email: backendUser.email,
        login: backendUser.login || backendUser.email,
        perfil: backendUser.profile?.name || "",
        perfilId: backendUser.profile?.profileId || null,
        status: backendUser.status || "ACTIVE"
    }
}

// Mapeador para Beneficiários (quando o controller for criado)
export const mapBeneficiaryToBackend = (frontendBeneficiary) => {
    // CPF pode ser vazio se NIF foi preenchido, mas não pode ser ambos vazios (validação já feita no frontend)
    const cpfValue =
        frontendBeneficiary.cpfCrnm || (frontendBeneficiary.nif ? "" : null)

    return {
        fullName: frontendBeneficiary.nomeCompleto,
        cpf: cpfValue || "", // Se não tem CPF mas tem NIF, envia string vazia
        phone: frontendBeneficiary.telefoneCelular, // Já vem limpo (apenas números) do frontend
        socioeconomicData:  'MODIFICAR PARA APARECER NO FRONT',
        beneficiaryStatus: "PENDING", // Status padrão
        withdrawalLimit: frontendBeneficiary.withdrawalLimit
            ? parseInt(frontendBeneficiary.withdrawalLimit)
            : null
    }
}

export const mapBeneficiaryFromBackend = (backendBeneficiary) => {


    return {
        id: backendBeneficiary.beneficiaryId,
        nomeCompleto: backendBeneficiary.fullName,
        cpfCrnm: backendBeneficiary.cpf,
        nif: "", // Campo não disponível no backend atual
        telefoneCelular: backendBeneficiary.phone,
        withdrawalLimit: backendBeneficiary.withdrawalLimit || "",
        currentWithdrawalsThisMonth:
            backendBeneficiary.currentWithdrawalsThisMonth || 0,
        remainingWithdrawals: backendBeneficiary.remainingWithdrawals || 0,
        status: backendBeneficiary.beneficiaryStatus
    }
}

// Mapeador para Voluntários (usando User com profile específico)
export const mapVolunteerToBackend = (frontendVolunteer) => {
    return {
        name: frontendVolunteer.nomeCompleto,
        email: frontendVolunteer.email,
        password: "volunteer123", // Senha padrão para voluntários
        profileId: 2 // Assumindo que profile 2 é para voluntários
    }
}

export const mapVolunteerFromBackend = (backendUser) => {
    return {
        id: backendUser.userId,
        nomeCompleto: backendUser.name,
        email: backendUser.email,
        telefoneCelular: "", // Campo não disponível no backend atual
        cpf: "", // Campo não disponível no backend atual
        endereco: "",
        bairro: "",
        numero: "",
        complemento: "",
        pontoReferencia: ""
    }
}
