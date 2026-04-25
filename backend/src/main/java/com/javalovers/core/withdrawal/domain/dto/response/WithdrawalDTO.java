package com.javalovers.core.withdrawal.domain.dto.response;

import com.javalovers.core.appuser.domain.dto.response.AppUserDTO;
import com.javalovers.core.beneficiary.domain.dto.response.BeneficiaryDTO;
import com.javalovers.core.itemwithdrawn.domain.dto.response.ItemWithdrawnDTO;

import java.util.Date;
import java.util.List;

public record WithdrawalDTO(
        Long withdrawalId,
        Date withdrawalDate,
        BeneficiaryDTO beneficiary,
        AppUserDTO appUser,
        List<ItemWithdrawnDTO> items
) {
}
