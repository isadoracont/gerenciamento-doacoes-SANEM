package com.javalovers.core.itemdonated.mapper;

import com.javalovers.core.donation.domain.entity.Donation;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.itemdonated.domain.dto.request.ItemDonatedFormDTO;
import com.javalovers.core.itemdonated.domain.entity.ItemDonated;
import org.springframework.stereotype.Service;

@Service
public class ItemDonatedCreateMapper {

    public ItemDonated convert(ItemDonatedFormDTO itemDonatedFormDTO, Donation donation, Item item) {
        ItemDonated itemDonated = new ItemDonated();
        itemDonated.setDonation(donation);
        itemDonated.setItem(item);
        itemDonated.setQuantity(itemDonatedFormDTO.quantity());

        return itemDonated;
    }
}
