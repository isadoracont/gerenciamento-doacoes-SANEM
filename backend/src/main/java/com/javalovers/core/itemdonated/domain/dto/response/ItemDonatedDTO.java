package com.javalovers.core.itemdonated.domain.dto.response;

import com.javalovers.core.item.domain.dto.response.ItemDTO;

public record ItemDonatedDTO(
        Long itemDonatedId,
        ItemDTO item,
        Integer quantity
) {
}
