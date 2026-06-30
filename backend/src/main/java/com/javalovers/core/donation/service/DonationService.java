package com.javalovers.core.donation.service;

import com.javalovers.common.exception.EntityNotFoundException;
import com.javalovers.core.inventory.service.InventoryService;
import com.javalovers.core.inventory.domain.enums.TransactionType;
import com.javalovers.core.donation.domain.dto.request.DonationFormDTO;
import com.javalovers.core.donation.domain.dto.response.DonationDTO;
import com.javalovers.core.donation.domain.entity.Donation;
import com.javalovers.core.donation.mapper.DonationCreateMapper;
import com.javalovers.core.donation.mapper.DonationDTOMapper;
import com.javalovers.core.donation.repository.DonationRepository;
import com.javalovers.core.donation.specification.DonationSpecification;
import com.javalovers.core.donor.domain.entity.Donor;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.item.service.ItemService;
import com.javalovers.core.itemdonated.domain.entity.ItemDonated;
import com.javalovers.core.itemdonated.repository.ItemDonatedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification; 
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
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

    private final InventoryService inventoryService;

    @Transactional
    public DonationDTO create(DonationFormDTO formDTO, Donor donor, AppUser user) {
        Donation donation = donationCreateMapper.convert(formDTO, donor, user);
        Donation donationSalva = donationRepository.save(donation);

        for (DonationFormDTO.DonationItemRequestDTO itemDTO : formDTO.items()) {
            Item item;

            // Cenário em que o item já existe: Busca no banco e aumenta o estoque
            if (itemDTO.itemId() != null) {
                item = itemService.getOrThrowException(itemDTO.itemId());
            } else {
                // Cenário em que o item é novo: Cria a entidade do zero
                item = new Item();
                item.setDescription(itemDTO.newItemName());
                item.setStockQuantity(0L); 
                itemService.save(item);
            }

           inventoryService.processTransaction(
                item, 
                itemDTO.quantity().longValue(), 
                TransactionType.DONATION_IN, 
                donationSalva.getDonationId()
            );

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
                
                inventoryService.processTransaction(
                    item, 
                    idon.getQuantity().longValue(), 
                    TransactionType.DONATION_REVERSAL, 
                    donation.getDonationId()
                );
                
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

    @Transactional(readOnly = true)
    public List<DonationDTO> findAllFiltered(
            Date startDate, 
            Date endDate, 
            String donorName, 
            String attendantName, 
            String itemName
    ) {
        if (startDate != null && endDate != null && startDate.after(endDate)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final.");
        }

        Specification<Donation> spec = Specification.where(DonationSpecification.isNotDeleted())
                .and(DonationSpecification.betweenDates(startDate, endDate))
                .and(DonationSpecification.hasDonorName(donorName))
                .and(DonationSpecification.hasAttendantName(attendantName))
                .and(DonationSpecification.hasItemName(itemName));

        List<Donation> donations = donationRepository.findAll(spec);
        
        return donations.stream()
                .distinct()
                .map(donationDTOMapper::convert)
                .collect(Collectors.toList());
    }

    public Donation getOrThrowException(Long id) {
        return donationRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Donation", id)
        );
    }
}
