package com.javalovers.core.donor.domain.dto.response;

public record DonorDTO(
        Long donorId,
        String name,
        String cpfCnpj,
        String contact
) {
}
