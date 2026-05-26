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
        String contact,

        @Email(message = "Email deve ter um formato válido")
        String email,

        @Size(max = 160, message = "Rua deve ter no máximo 160 caracteres")
        String streetAddress,

        Integer numberAddress,

        @Size(max = 160, message = "Complemento deve ter no máximo 160 caracteres")
        String detailsAddress,

        @Size(max = 160, message = "Bairro deve ter no máximo 160 caracteres")
        String nbAddress,

        @Pattern(regexp = "^([0-9]{8})?$", message = "CEP deve conter exatamente 8 dígitos numéricos")
        String cep

) {
}
