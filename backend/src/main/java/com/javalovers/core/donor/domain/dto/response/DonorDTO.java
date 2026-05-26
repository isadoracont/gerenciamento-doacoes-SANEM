package com.javalovers.core.donor.domain.dto.response;

public record DonorDTO(
        Long donorId,
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
