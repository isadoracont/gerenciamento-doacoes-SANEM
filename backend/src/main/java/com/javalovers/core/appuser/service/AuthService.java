package com.javalovers.core.appuser.service;

import com.javalovers.core.appuser.domain.dto.request.LoginRequestDTO;
import com.javalovers.core.appuser.domain.dto.response.LoginResponseDTO;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.appuser.repository.AppUserRepository;
import com.javalovers.common.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final AppUserRepository appUserRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public LoginResponseDTO authenticate(LoginRequestDTO loginRequest) {
      AppUser user = appUserRepository.findByLogin(loginRequest.getLogin())
          .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

      if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
          throw new RuntimeException("Senha incorreta");
      }

      if (user.getStatus() != com.javalovers.core.status.Status.ACTIVE) {
          throw new RuntimeException("Usuário inativo");
      }

      String token = jwtService.generateToken(user.getLogin());

      return new LoginResponseDTO(
          token,
          user.getName(),
          user.getEmail(),
          user.getProfile().getName(),
          user.getUserId()
      );
  }

  public AppUser getCurrentUser() {
      var auth = SecurityContextHolder.getContext().getAuthentication();
      String login = auth.getName();
    return appUserRepository.findByLogin(login)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
  }

  public boolean validateToken(String token) {
    try {
        jwtService.extractLogin(token);
        return true;
    } catch (Exception e) {
        return false;
    }
  }
}
