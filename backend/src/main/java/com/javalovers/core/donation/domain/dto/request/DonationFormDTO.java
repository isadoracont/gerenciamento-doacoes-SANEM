package com.javalovers.core.donation.domain.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Date;
import java.util.List;

public record DonationFormDTO(

        @NotNull
        Date donationDate,

        @NotNull
        Long attendantUserId,
        Long donorId,

        @NotEmpty(message = "A doação deve conter pelo menos um item")
        List<DonationItemRequestDTO> items
) {
        public record DonationItemRequestDTO(
                Long itemId,
                Integer quantity,
                String newItemName
        ) {}
}
