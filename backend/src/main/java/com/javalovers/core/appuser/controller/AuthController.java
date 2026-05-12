package com.javalovers.core.appuser.controller;

import com.javalovers.core.appuser.domain.dto.request.LoginRequestDTO;
import com.javalovers.core.appuser.domain.dto.response.LoginResponseDTO;
import com.javalovers.core.appuser.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO loginRequest) {
      try {
          LoginResponseDTO response = authService.authenticate(loginRequest);
          return ResponseEntity.ok(response);
      } catch (Exception e) {
          return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
      }
  }

  @PostMapping("/validate")
  public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
      try {
          String rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;
          boolean isValid = authService.validateToken(rawToken);
          return ResponseEntity.ok(isValid);
      } catch (Exception e) {
          return ResponseEntity.ok(false);
      }
  }
}
