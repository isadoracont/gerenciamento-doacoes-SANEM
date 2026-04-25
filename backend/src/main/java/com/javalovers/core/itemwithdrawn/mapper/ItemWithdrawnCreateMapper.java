package com.javalovers.core.itemwithdrawn.mapper;

import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.itemwithdrawn.domain.dto.request.ItemWithdrawnFormDTO;
import com.javalovers.core.itemwithdrawn.domain.entity.ItemWithdrawn;
import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import org.springframework.stereotype.Service;

@Service
public class ItemWithdrawnCreateMapper {

    public ItemWithdrawn convert(ItemWithdrawnFormDTO itemWithdrawnFormDTO, Withdrawal withdrawal, Item item) {

        ItemWithdrawn itemWithdrawn = new ItemWithdrawn();
        itemWithdrawn.setWithdrawal(withdrawal);
        itemWithdrawn.setItem(item);
        itemWithdrawn.setQuantity(itemWithdrawnFormDTO.quantity());

        return itemWithdrawn;
    }
}
