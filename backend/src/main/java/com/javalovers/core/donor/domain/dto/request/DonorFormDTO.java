package com.javalovers.core.donor.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DonorFormDTO(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 255, message = "Nome deve ter entre 3 e 255 caracteres")
        String name,
        
        @Pattern(regexp = "^([0-9]{11}|[0-9]{14})$", message = "CPF/CNPJ deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)")
        String cpfCnpj,
        
        @NotBlank(message = "Contato é obrigatório")
        @Email(message = "Email deve ter um formato válido")
        String contact
) {
}
