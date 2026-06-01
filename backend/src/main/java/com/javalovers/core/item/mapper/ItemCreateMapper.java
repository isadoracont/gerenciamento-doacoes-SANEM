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
        item.setTagCode(itemFormDTO.tagCode());
        
        return item;
    }
}
