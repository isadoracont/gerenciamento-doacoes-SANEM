package com.javalovers.core.item.domain.dto.request;

public record ItemFilterDTO(
        String description,
        Long stockQuantity,
        String tagCode
) {
}
