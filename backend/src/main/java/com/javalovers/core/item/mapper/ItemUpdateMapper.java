package com.javalovers.core.item.mapper;

import com.javalovers.core.item.domain.dto.request.ItemFormDTO;
import com.javalovers.core.item.domain.entity.Item;
import org.springframework.stereotype.Service;

@Service
public class ItemUpdateMapper {

    public void update(Item item, ItemFormDTO itemFormDTO){
        item.setDescription(itemFormDTO.description());
        item.setStockQuantity(itemFormDTO.stockQuantity());
        item.setTagCode(itemFormDTO.tagCode());
    }
}
