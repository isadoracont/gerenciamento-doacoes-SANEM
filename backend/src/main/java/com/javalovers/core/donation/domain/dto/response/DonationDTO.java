package com.javalovers.core.donation.domain.dto.response;

import com.javalovers.core.donor.domain.dto.response.DonorDTO;
import com.javalovers.core.appuser.domain.dto.response.AppUserDTO;
import com.javalovers.core.itemdonated.domain.dto.response.ItemDonatedDTO;

import java.util.Date;
import java.util.List;

public record DonationDTO(
        Long donationId,
        Date donationDate,
        AppUserDTO receiverUser,
        DonorDTO donor,
        List<ItemDonatedDTO> items
) {
}
