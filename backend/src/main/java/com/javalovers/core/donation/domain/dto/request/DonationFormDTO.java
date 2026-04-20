package com.javalovers.core.donation.domain.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record DonationFormDTO(

        @NotNull
        Date donationDate,

        @NotNull
        Long receiverUserId,
        Long donorId
) {
}
