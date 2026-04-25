package com.javalovers.core.itemwithdrawn.mapper;

import com.javalovers.core.item.mapper.ItemDTOMapper;
import com.javalovers.core.itemwithdrawn.domain.dto.response.ItemWithdrawnDTO;
import com.javalovers.core.itemwithdrawn.domain.entity.ItemWithdrawn;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ItemWithdrawnDTOMapper {

    private final ItemDTOMapper itemDTOMapper;

    public ItemWithdrawnDTO convert(ItemWithdrawn itemWithdrawn) {
        if (itemWithdrawn == null) { return null; }

        return new ItemWithdrawnDTO(
                itemWithdrawn.getItemWithdrawnId(),
                itemDTOMapper.convert(itemWithdrawn.getItem()),
                itemWithdrawn.getQuantity()
        );
    }
}
