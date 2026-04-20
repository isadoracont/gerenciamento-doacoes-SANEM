package com.javalovers.core.card.dto.request;

public record CardFilterDTO(
        String uniqueNumber,
        Long beneficiaryId
) {
}
