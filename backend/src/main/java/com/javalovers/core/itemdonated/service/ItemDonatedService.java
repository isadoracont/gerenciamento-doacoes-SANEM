package com.javalovers.core.itemdonated.service;

import com.javalovers.common.exception.EntityNotFoundException;
import com.javalovers.core.donation.domain.entity.Donation;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.item.repository.ItemRepository;
import com.javalovers.core.itemdonated.domain.dto.request.ItemDonatedFormDTO;
import com.javalovers.core.itemdonated.domain.dto.response.ItemDonatedDTO;
import com.javalovers.core.itemdonated.domain.entity.ItemDonated;
import com.javalovers.core.itemdonated.mapper.ItemDonatedCreateMapper;
import com.javalovers.core.itemdonated.mapper.ItemDonatedDTOMapper;
import com.javalovers.core.itemdonated.repository.ItemDonatedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemDonatedService {

    private final ItemDonatedRepository itemDonatedRepository;
    private final ItemRepository itemRepository;
    private final ItemDonatedDTOMapper itemDonatedDTOMapper;
    private final ItemDonatedCreateMapper itemDonatedCreateMapper;

    public ItemDonated generateItemDonated(ItemDonatedFormDTO itemDonatedFormDTO, Donation donation, Item item) {
        return itemDonatedCreateMapper.convert(itemDonatedFormDTO, donation, item);
    }

    public void save(ItemDonated itemDonated) {
        itemDonatedRepository.save(itemDonated);
    }

    public ItemDonatedDTO generateItemDonatedDTO(ItemDonated itemDonated) {
        return itemDonatedDTOMapper.convert(itemDonated);
    }

    public ItemDonated getOrNull(Long id) {
        return itemDonatedRepository.findById(id).orElse(null);
    }

    public ItemDonated getOrThrowException(Long id) {
        return itemDonatedRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("ItemDonated", id)
        );
    }

}
