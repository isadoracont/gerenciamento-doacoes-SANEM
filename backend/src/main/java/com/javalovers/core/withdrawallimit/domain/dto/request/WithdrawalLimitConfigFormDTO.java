package com.javalovers.core.withdrawallimit.domain.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WithdrawalLimitConfigFormDTO(
        @NotNull(message = "Limite mensal é obrigatório")
        @Min(value = 1, message = "Limite mensal deve ser maior que zero")
        Integer monthlyItemLimit,
        
        @NotNull(message = "Status ativo é obrigatório")
        Boolean isActive
) {
}

