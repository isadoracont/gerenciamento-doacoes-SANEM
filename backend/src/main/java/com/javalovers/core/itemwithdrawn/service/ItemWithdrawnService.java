package com.javalovers.core.itemwithdrawn.service;

import com.javalovers.common.exception.EntityNotFoundException;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.item.repository.ItemRepository;
import com.javalovers.core.itemwithdrawn.domain.dto.request.ItemWithdrawnFormDTO;
import com.javalovers.core.itemwithdrawn.domain.dto.response.ItemWithdrawnDTO;
import com.javalovers.core.itemwithdrawn.domain.entity.ItemWithdrawn;
import com.javalovers.core.itemwithdrawn.mapper.ItemWithdrawnCreateMapper;
import com.javalovers.core.itemwithdrawn.mapper.ItemWithdrawnDTOMapper;
import com.javalovers.core.itemwithdrawn.repository.ItemWithdrawnRepository;
import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemWithdrawnService {

    private final ItemWithdrawnRepository itemWithdrawnRepository;
    private final ItemRepository itemRepository;
    private final ItemWithdrawnDTOMapper itemWithdrawnDTOMapper;
    private final ItemWithdrawnCreateMapper itemWithdrawnCreateMapper;

    public ItemWithdrawn generateItemWithdrawn(ItemWithdrawnFormDTO itemWithdrawnFormDTO, Withdrawal withdrawal, Item item) {
        return itemWithdrawnCreateMapper.convert(itemWithdrawnFormDTO, withdrawal, item);
    }

    public void save(ItemWithdrawn itemWithdrawn) {
        itemWithdrawnRepository.save(itemWithdrawn);
    }

    public ItemWithdrawnDTO generateItemWithdrawnDTO(ItemWithdrawn itemWithdrawn) {
        return itemWithdrawnDTOMapper.convert(itemWithdrawn);
    }

    public ItemWithdrawn getOrNull(Long id) {
        return itemWithdrawnRepository.findById(id).orElse(null);
    }

    public ItemWithdrawn getOrThrowException(Long id) {
        return itemWithdrawnRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("ItemWithdrawn", id)
        );
    }

    public void delete(ItemWithdrawn itemWithdrawn) {
        itemWithdrawnRepository.delete(itemWithdrawn);
    }

}
