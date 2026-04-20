package com.javalovers.core.itemwithdrawn.domain.dto.response;

import com.javalovers.core.item.domain.dto.response.ItemDTO;

public record ItemWithdrawnDTO(
         Long itemWithdrawnId,
         ItemDTO itemDTO,
         Integer quantity
) {
}
