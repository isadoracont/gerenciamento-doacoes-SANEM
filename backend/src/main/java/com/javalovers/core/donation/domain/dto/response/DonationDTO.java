package com.javalovers.core.donation.domain.dto.response;

import com.javalovers.core.donor.domain.dto.response.DonorDTO;
import com.javalovers.core.appuser.domain.dto.response.AppUserDTO;

import java.util.Date;

public record DonationDTO(
        Long donationId,
        Date donationDate,
        AppUserDTO receiverUser,
        DonorDTO donor
) {
}
