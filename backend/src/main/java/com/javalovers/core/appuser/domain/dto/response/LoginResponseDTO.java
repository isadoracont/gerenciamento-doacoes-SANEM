package com.javalovers.core.appuser.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {

  private String token;
  private String name;
  private String email;
  private String role;
  private Long userId;
}

