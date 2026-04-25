package com.javalovers.core.appuser.domain.dto.request;

import com.javalovers.core.profile.domain.entity.Profile;
import com.javalovers.core.status.Status;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AppUserUpdateDTO(
                @NotBlank(message = "Nome é obrigatório")
                @Size(min = 3, max = 255, message = "Nome deve ter entre 3 e 255 caracteres")
                String name,
                
                @NotBlank(message = "Login é obrigatório")
                @Size(min = 3, max = 50, message = "Login deve ter entre 3 e 50 caracteres")
                String login,
                
                @NotBlank(message = "Email é obrigatório")
                @Email(message = "Email deve ter um formato válido")
                String email,
                
                // Senha é opcional na atualização
                @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
                String password,
                
                @NotNull(message = "Status é obrigatório")
                Status status,
                
                @NotNull(message = "Perfil é obrigatório")
                Profile profile) {
}

