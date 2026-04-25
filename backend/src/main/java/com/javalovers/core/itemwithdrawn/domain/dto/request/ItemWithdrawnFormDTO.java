package com.javalovers.core.itemwithdrawn.domain.dto.request;

public record ItemWithdrawnFormDTO(
        Long withdrawalId,
        Long itemId,
        Integer quantity
) {
}
