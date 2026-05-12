package com.javalovers.core.donation.service;

import com.javalovers.common.exception.EntityNotFoundException;
import com.javalovers.core.donation.domain.dto.request.DonationFormDTO;
import com.javalovers.core.donation.domain.dto.response.DonationDTO;
import com.javalovers.core.donation.domain.entity.Donation;
import com.javalovers.core.donation.mapper.DonationCreateMapper;
import com.javalovers.core.donation.mapper.DonationDTOMapper;
import com.javalovers.core.donation.repository.DonationRepository;
import com.javalovers.core.donor.domain.entity.Donor;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.item.service.ItemService;
import com.javalovers.core.itemdonated.domain.entity.ItemDonated;
import com.javalovers.core.itemdonated.repository.ItemDonatedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonationCreateMapper donationCreateMapper;
    private final DonationDTOMapper donationDTOMapper;

    private final ItemService itemService; 
    private final ItemDonatedRepository itemDonatedRepository;

    @Transactional
    public DonationDTO create(DonationFormDTO formDTO, Donor donor, AppUser user) {
        Donation donation = donationCreateMapper.convert(formDTO, donor, user);
        Donation donationSalva = donationRepository.save(donation);

        for (DonationFormDTO.DonationItemRequestDTO itemDTO : formDTO.items()) {
            Item item;

            // Cenário em que o item já existe: Busca no banco e aumenta o estoque
            if (itemDTO.itemId() != null) {
                item = itemService.getOrThrowException(itemDTO.itemId());
                
                Long estoqueAtual = item.getStockQuantity() != null ? item.getStockQuantity() : 0L;
                item.setStockQuantity(estoqueAtual + itemDTO.quantity().longValue());
                
            } else {
                // Cenário em que o item é novo: Cria a entidade do zero
                item = new Item();
                
                item.setDescription(itemDTO.newItemName());
                item.setStockQuantity(itemDTO.quantity().longValue());
            }

            itemService.save(item);

            ItemDonated itemDonated = new ItemDonated();
            itemDonated.setDonation(donationSalva);
            itemDonated.setItem(item);
            itemDonated.setQuantity(itemDTO.quantity());
            itemDonatedRepository.save(itemDonated);
        }

        return donationDTOMapper.convert(donationSalva);
    }

    @Transactional
    public void delete(Long id) {
        Donation donation = getOrThrowException(id);

        if (donation.getItems() != null) {
            for(ItemDonated idon : donation.getItems()) {
                Item item = idon.getItem();
                
                Long estoqueAtual = item.getStockQuantity() != null ? item.getStockQuantity() : 0L;
                Long novoEstoque = Math.max(0L, estoqueAtual - idon.getQuantity().longValue()); 
                
                item.setStockQuantity(novoEstoque);
                itemService.save(item);
                
                idon.softDelete();
                itemDonatedRepository.save(idon);
            }
        }

        donation.softDelete();
        donationRepository.save(donation);
    }

    @Transactional(readOnly = true)
    public DonationDTO findById(Long id) {
        return donationRepository.findById(id)
                .map(donationDTOMapper::convert)
                .orElseThrow(() -> new RuntimeException("Doação não encontrada com ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<DonationDTO> findAll() {
        return donationRepository.findAll()
                .stream()
                .map(donationDTOMapper::convert)
                .collect(Collectors.toList());
    }

    public Donation getOrThrowException(Long id) {
        return donationRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Donation", id)
        );
    }
}
