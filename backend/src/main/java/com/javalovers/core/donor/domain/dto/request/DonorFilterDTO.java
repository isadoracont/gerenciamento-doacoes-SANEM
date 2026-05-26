package com.javalovers.core.donor.domain.dto.request;

public record DonorFilterDTO(
        String name,
        String cpfCnpj,
        String contact,
        String email,
        String streetAddress,
        Integer numberAddress,
        String detailsAddress,
        String nbAddress,
        String cep
) {
}
