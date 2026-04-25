package com.javalovers.core.beneficiary.mapper;

import com.javalovers.core.beneficiary.domain.dto.request.BeneficiaryFormDTO;
import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import org.springframework.stereotype.Service;

@Service
public class BeneficiaryCreateMapper {

    public Beneficiary convert(BeneficiaryFormDTO beneficiaryFormDTO) {
        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setFullName(beneficiaryFormDTO.fullName());
        beneficiary.setCpf(beneficiaryFormDTO.cpf());
        beneficiary.setPhone(beneficiaryFormDTO.phone());
        beneficiary.setSocioeconomicData(beneficiaryFormDTO.socioeconomicData());
        beneficiary.setBeneficiaryStatus(beneficiaryFormDTO.beneficiaryStatus());
        beneficiary.setWithdrawalLimit(beneficiaryFormDTO.withdrawalLimit());
        beneficiary.setCurrentWithdrawalsThisMonth(0); // Inicializar com 0

        return beneficiary;
    }
}
