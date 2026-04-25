package com.javalovers.core.appuser.service;

import com.javalovers.core.appuser.domain.dto.request.LoginRequestDTO;
import com.javalovers.core.appuser.domain.dto.response.LoginResponseDTO;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.appuser.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final AppUserRepository appUserRepository;
  private final PasswordEncoder passwordEncoder;

  public LoginResponseDTO authenticate(LoginRequestDTO loginRequest) {
    System.out.println("Tentando fazer login com: " + loginRequest.getLogin());

    // Primeiro, vamos testar se conseguimos buscar todos os usuários
    System.out.println("Total de usuários no banco: " + appUserRepository.count());

    // Vamos listar todos os usuários para debug
    appUserRepository.findAll().forEach(u -> {
      System.out.println("Usuário encontrado: " + u.getLogin() + " - " + u.getName());
    });

    AppUser user = appUserRepository.findByLogin(loginRequest.getLogin())
        .orElseThrow(() -> {
          System.out.println("Usuário não encontrado: " + loginRequest.getLogin());
          return new RuntimeException("Usuário não encontrado");
        });

    System.out.println("Usuário encontrado: " + user.getName());
    System.out.println("Status do usuário: " + user.getStatus());
    System.out.println("Profile do usuário: " + (user.getProfile() != null ? user.getProfile().getName() : "NULL"));

    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
      throw new RuntimeException("Senha incorreta");
    }

    if (user.getStatus() != com.javalovers.core.status.Status.ACTIVE) {
      throw new RuntimeException("Usuário inativo");
    }

    String token = generateToken();

    return new LoginResponseDTO(
        token,
        user.getName(),
        user.getEmail(),
        user.getProfile().getName(),
        user.getUserId());
  }

  public boolean validateToken(String token) {
    // Implementação simples de validação de token
    // Em produção, usar JWT ou similar
    return token != null && token.startsWith("Bearer ");
  }

  private String generateToken() {
    return "Bearer " + UUID.randomUUID().toString();
  }
}
