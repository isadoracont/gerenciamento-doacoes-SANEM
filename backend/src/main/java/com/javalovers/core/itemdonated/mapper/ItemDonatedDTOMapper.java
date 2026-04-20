package com.javalovers.core.itemdonated.mapper;

import com.javalovers.core.donation.mapper.DonationDTOMapper;
import com.javalovers.core.item.mapper.ItemDTOMapper;
import com.javalovers.core.itemdonated.domain.dto.response.ItemDonatedDTO;
import com.javalovers.core.itemdonated.domain.entity.ItemDonated;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ItemDonatedDTOMapper {

    private final DonationDTOMapper donationDTOMapper;
    private final ItemDTOMapper itemDTOMapper;

    public ItemDonatedDTO convert(ItemDonated itemDonated) {
        if (itemDonated == null) {
            return null;
        }

        return new ItemDonatedDTO(
                itemDonated.getItemDonatedId(),
                donationDTOMapper.convert(itemDonated.getDonation()),
                itemDTOMapper.convert(itemDonated.getItem()),
                itemDonated.getQuantity()
        );
    }
}
