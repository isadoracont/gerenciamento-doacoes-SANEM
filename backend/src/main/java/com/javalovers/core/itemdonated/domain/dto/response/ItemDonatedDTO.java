package com.javalovers.core.itemdonated.domain.dto.response;

import com.javalovers.core.donation.domain.dto.response.DonationDTO;
import com.javalovers.core.item.domain.dto.response.ItemDTO;

public record ItemDonatedDTO(
        Long itemDonatedId,
        DonationDTO donation,
        ItemDTO item,
        Integer quantity
) {
}
