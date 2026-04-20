package com.javalovers.core.beneficiary.domain.dto.response;

import com.javalovers.core.beneficiarystatus.BeneficiaryStatus;
import com.javalovers.core.appuser.domain.dto.response.AppUserDTO;

public record BeneficiaryDTO (
        Long beneficiaryId,
        String fullName,
        String cpf,
        String phone,
        String socioeconomicData,
        BeneficiaryStatus beneficiaryStatus,
        AppUserDTO approverId,
        Integer withdrawalLimit,
        Integer currentWithdrawalsThisMonth
){
}
