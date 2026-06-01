package com.javalovers.core.beneficiary.mapper;

import com.javalovers.core.beneficiary.domain.dto.response.BeneficiaryDTO;
import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import com.javalovers.core.withdrawal.service.WithdrawalService;
import com.javalovers.core.appuser.mapper.AppUserDTOMapper;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
public class BeneficiaryDTOMapper {

    private final AppUserDTOMapper appUserDTOMapper;
    private final WithdrawalService withdrawalService;

    public BeneficiaryDTOMapper(AppUserDTOMapper appUserDTOMapper, @Lazy WithdrawalService withdrawalService) {
        this.appUserDTOMapper = appUserDTOMapper;
        this.withdrawalService = withdrawalService;
    }

    public BeneficiaryDTO convert(Beneficiary beneficiary){
        if(beneficiary == null) return null;

        int totalLimit = withdrawalService.getMonthlyLimit(beneficiary.getBeneficiaryId());
        int currentWithdrawals = withdrawalService.getItemsWithdrawnThisMonth(beneficiary.getBeneficiaryId());
        int remainingWithdrawals = Math.max(0, totalLimit - currentWithdrawals);

        return new BeneficiaryDTO(
                beneficiary.getBeneficiaryId(),
                beneficiary.getFullName(),
                beneficiary.getCpf(),
                beneficiary.getPhone(),
                beneficiary.getSocioeconomicData(),
                beneficiary.getBeneficiaryStatus(),
                appUserDTOMapper.convert(beneficiary.getApproverId()),
                totalLimit,
                currentWithdrawals,
                remainingWithdrawals
        );
    }
}
