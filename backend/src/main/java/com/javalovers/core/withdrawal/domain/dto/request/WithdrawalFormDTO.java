package com.javalovers.core.withdrawal.domain.dto.request;

import java.util.Date;
import java.util.List;

public record WithdrawalFormDTO(
        Date withdrawalDate,
        Long beneficiaryId,
        Long attendantUserId,
        List<WithdrawalItemDTO> items
) {
    public record WithdrawalItemDTO(
            Long itemId,
            Integer quantity
    ) {}
}
