package com.javalovers.core.item.domain.dto.response;

public record ItemLabelDTO(
        Long itemId,
        String description,
        String tagCode,
        String qrCodeBase64
) {
}

