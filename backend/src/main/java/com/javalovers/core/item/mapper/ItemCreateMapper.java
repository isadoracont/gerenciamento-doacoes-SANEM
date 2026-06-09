package com.javalovers.core.item.mapper;

import com.javalovers.core.item.domain.dto.request.ItemFormDTO;
import com.javalovers.core.item.domain.entity.Item;
import org.springframework.stereotype.Service;

@Service
public class ItemCreateMapper {

    public Item convert(ItemFormDTO itemFormDTO){
        Item item = new Item();
        item.setDescription(itemFormDTO.description());
        item.setStockQuantity(0L); 
        String tag = itemFormDTO.tagCode();
        if (tag != null && tag.trim().isEmpty()) {
            tag = null;
        }
        item.setTagCode(tag);

        return item;
    }
}
