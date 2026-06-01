package com.javalovers.core.donor.domain.dto.request;

import com.javalovers.common.validation.ValidCpfCnpj;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DonorFormDTO(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 255, message = "Nome deve ter entre 3 e 255 caracteres")
        String name,
        
        @ValidCpfCnpj(message = "CPF/CNPJ inválido")
        String cpfCnpj,
        
        @NotBlank(message = "Contato é obrigatório")
        @Email(message = "Email deve ter um formato válido")
        String contact
) {
}
