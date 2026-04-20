package com.javalovers.core.withdrawal.domain.dto.request;

import java.util.Date;

public record WithdrawalFilterDTO(
        Date withdrawalDate,
        Long beneficiaryId,
        Long attendantUserId
) {
}
