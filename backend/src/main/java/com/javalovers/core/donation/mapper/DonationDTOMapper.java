package com.javalovers.core.donation.mapper;

import com.javalovers.core.donation.domain.dto.response.DonationDTO;
import com.javalovers.core.donation.domain.entity.Donation;
import com.javalovers.core.donor.mapper.DonorDTOMapper;
import com.javalovers.core.appuser.mapper.AppUserDTOMapper;
import com.javalovers.core.itemdonated.domain.dto.response.ItemDonatedDTO;
import com.javalovers.core.itemdonated.mapper.ItemDonatedDTOMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationDTOMapper {

    private final DonorDTOMapper donorDTOMapper;
    private final AppUserDTOMapper appUserDTOMapper;
    private final ItemDonatedDTOMapper itemDonatedDTOMapper;

    public DonationDTO convert(Donation donation) {
        if(donation == null) return null;

        List<ItemDonatedDTO> itemsDTO = null;
        if (donation.getItems() != null) {
            itemsDTO = donation.getItems().stream()
                    .map(itemDonatedDTOMapper::convert)
                    .toList();
        }

        return new DonationDTO(
                donation.getDonationId(),
                donation.getDonationDate(),
                appUserDTOMapper.convert(donation.getReceiverUser()),
                donorDTOMapper.convert(donation.getDonor()),
                itemsDTO
        );
    }

}
