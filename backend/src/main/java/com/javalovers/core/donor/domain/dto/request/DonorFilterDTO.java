package com.javalovers.core.donor.domain.dto.request;

public record DonorFilterDTO(
        String name,
        String cpfCnpj,
        String contact
) {
}
