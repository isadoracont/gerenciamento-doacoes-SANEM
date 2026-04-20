package com.javalovers.core.beneficiary.mapper;

import com.javalovers.core.beneficiary.domain.dto.response.BeneficiaryDTO;
import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import com.javalovers.core.appuser.mapper.AppUserDTOMapper;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BeneficiaryDTOMapper {

    private final AppUserDTOMapper appUserDTOMapper;

    public BeneficiaryDTO convert(Beneficiary beneficiary){
        if(beneficiary == null) return null;
        return new BeneficiaryDTO(
                beneficiary.getBeneficiaryId(),
                beneficiary.getFullName(),
                beneficiary.getCpf(),
                beneficiary.getPhone(),
                beneficiary.getSocioeconomicData(),
                beneficiary.getBeneficiaryStatus(),
                appUserDTOMapper.convert(beneficiary.getApproverId()),
                beneficiary.getWithdrawalLimit(),
                beneficiary.getCurrentWithdrawalsThisMonth()
        );
    }
}
