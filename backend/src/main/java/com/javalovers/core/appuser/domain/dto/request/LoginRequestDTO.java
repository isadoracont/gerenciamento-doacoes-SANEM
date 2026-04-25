package com.javalovers.core.appuser.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

  @NotBlank(message = "Login é obrigatório")
  private String login;

  @NotBlank(message = "Senha é obrigatória")
  private String password;
}

