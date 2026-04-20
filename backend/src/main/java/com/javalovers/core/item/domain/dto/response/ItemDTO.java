package com.javalovers.core.item.domain.dto.response;

public record ItemDTO(
        Long itemId,
        String description,
        Long stockQuantity,
        String tagCode
)
{
}
