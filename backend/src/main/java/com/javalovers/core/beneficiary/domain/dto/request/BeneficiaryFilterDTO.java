package com.javalovers.core.beneficiary.domain.dto.request;

import com.javalovers.core.beneficiarystatus.BeneficiaryStatus;

public record BeneficiaryFilterDTO (
        String fullName,
        String cpf,
        String phone,
        String socioeconomicData,
        BeneficiaryStatus beneficiaryStatus
){
}
