package com.javalovers.core.item.service;

import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.common.specification.SpecificationHelper;
import com.javalovers.core.item.domain.dto.request.ItemFilterDTO;
import com.javalovers.core.item.domain.dto.request.ItemFormDTO;
import com.javalovers.core.item.domain.dto.response.ItemDTO;
import com.javalovers.core.item.domain.dto.response.ItemLabelDTO;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.item.mapper.ItemCreateMapper;
import com.javalovers.core.item.mapper.ItemDTOMapper;
import com.javalovers.core.item.mapper.ItemUpdateMapper;
import com.javalovers.core.item.repository.ItemRepository;
import com.javalovers.core.item.specification.ItemSpecification;
import com.javalovers.core.item.util.QRCodeService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import com.google.zxing.WriterException;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemCreateMapper itemCreateMapper;
    private final ItemDTOMapper itemDTOMapper;
    private final ItemUpdateMapper itemUpdateMapper;
    private final QRCodeService qrCodeService;
    private final EntityManager entityManager;

    public Item generateItem(ItemFormDTO itemFormDTO) {
        return itemCreateMapper.convert(itemFormDTO);
    }

    @Transactional
    public Item createAndSave(ItemFormDTO itemFormDTO) {
        Item item = itemCreateMapper.convert(itemFormDTO);
        return itemRepository.save(item);
    }

    @Transactional
    public void save(Item item) {
        itemRepository.save(item);
    }

    public ItemDTO generateItemDTO(Item item) {
        return itemDTOMapper.convert(item);
    }

    public Item getOrNull(Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    public Item getOrThrowException(Long id) {
        return itemRepository.findById(id).orElseThrow(
                () -> new com.javalovers.common.exception.EntityNotFoundException("item", id));
    }

    public void updateItem(Item item, ItemFormDTO itemFormDTO) {
        itemUpdateMapper.update(item, itemFormDTO);
    }

    @Transactional
    public void delete(Item item) {
        Long itemId = item.getItemId();
        
        // Soft delete dos registros em item_donated que referenciam este item
        Query deleteItemDonatedQuery = entityManager.createNativeQuery(
            "UPDATE item_donated SET deleted_at = NOW() WHERE item_id = ? AND deleted_at IS NULL"
        );
        deleteItemDonatedQuery.setParameter(1, itemId);
        deleteItemDonatedQuery.executeUpdate();
        
        // Soft delete dos registros em item_withdrawn que referenciam este item
        Query deleteItemWithdrawnQuery = entityManager.createNativeQuery(
            "UPDATE item_withdrawn SET deleted_at = NOW() WHERE item_id = ? AND deleted_at IS NULL"
        );
        deleteItemWithdrawnQuery.setParameter(1, itemId);
        deleteItemWithdrawnQuery.executeUpdate();
        
        // Soft delete do item
        item.softDelete();
        itemRepository.save(item);
    }

    public List<Item> list(ItemFilterDTO itemFilterDTO) {
        Specification<Item> itemSpecification = generateSpecification(itemFilterDTO);
        return itemRepository.findAll(itemSpecification);
    }

    public Page<Item> list(Pageable pageable, ItemFilterDTO itemFilterDTO) {
        Specification<Item> itemSpecification = generateSpecification(itemFilterDTO);
        return itemRepository.findAll(itemSpecification, pageable);
    }

    private Specification<Item> generateSpecification(ItemFilterDTO itemFilterDTO) {
        SearchCriteria<String> descriptionCriteria = SpecificationHelper.generateInnerLikeCriteria("description",
                itemFilterDTO.description());
        SearchCriteria<Long> stockQuantityCriteria = SpecificationHelper.generateEqualsCriteria("stockQuantity",
                itemFilterDTO.stockQuantity());
        SearchCriteria<String> tagCodeCriteria = SpecificationHelper.generateInnerLikeCriteria("tagCode",
                itemFilterDTO.tagCode());

        Specification<Item> descriptionSpecification = new ItemSpecification(descriptionCriteria);
        Specification<Item> stockQuantitySpecification = new ItemSpecification(stockQuantityCriteria);
        Specification<Item> tagCodeSpecification = new ItemSpecification(tagCodeCriteria);

        return Specification.where(descriptionSpecification)
                .and(stockQuantitySpecification)
                .and(tagCodeSpecification);
    }

    public Page<ItemDTO> generateItemDTOPage(Page<Item> itemPage) {
        return itemPage.map(this::generateItemDTO);
    }

    public List<ItemDTO> generateItemDTOList(List<Item> itemList) {
        return itemList.stream().map(itemDTOMapper::convert).toList();
    }

    @Transactional
    public String generateTagCode(Long itemId) {
        Item item = getOrNull(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Item não encontrado");
        }

        if (item.getTagCode() != null && !item.getTagCode().isEmpty()) {
            return item.getTagCode();
        }

        String tagCode = generateUniqueTagCode();

        // Garantir que o código seja único
        while (itemRepository.findByTagCode(tagCode).isPresent()) {
            tagCode = generateUniqueTagCode();
        }

        item.setTagCode(tagCode);
        itemRepository.save(item);

        return tagCode;
    }

    private String generateUniqueTagCode() {
        String uuidPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        String timestampPart = String.valueOf(System.currentTimeMillis()).substring(8);
        return "ITEM-" + uuidPart + timestampPart;
    }

    public String generateQRCodeForItem(Long itemId) throws WriterException, IOException {
        Item item = getOrNull(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Item não encontrado");
        }

        String tagCode = item.getTagCode();
        if (tagCode == null || tagCode.isEmpty()) {
            tagCode = generateTagCode(itemId);
        }

        String qrData = String.format("ITEM:%s|DESC:%s", tagCode, item.getDescription());
        return qrCodeService.generateQRCodeBase64(qrData);
    }

    public ItemLabelDTO generateItemLabel(Long itemId) throws WriterException, IOException {
        Item item = getOrNull(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Item não encontrado");
        }

        String tagCode = item.getTagCode();
        if (tagCode == null || tagCode.isEmpty()) {
            tagCode = generateTagCode(itemId);
        }

        String qrCodeBase64 = generateQRCodeForItem(itemId);

        return new ItemLabelDTO(
                item.getItemId(),
                item.getDescription(),
                tagCode,
                qrCodeBase64);
    }

}
