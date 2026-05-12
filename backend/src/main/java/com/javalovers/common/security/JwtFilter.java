package com.javalovers.common.security;

import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.appuser.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        System.out.println("=== JwtFilter ===");
        System.out.println("URL: " + request.getRequestURI());
        System.out.println("Authorization header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Token extraído: " + token);

            try {
                String login = jwtService.extractLogin(token);
                System.out.println("Login extraído do token: " + login);

                AppUser user = appUserRepository.findByLogin(login).orElse(null);
                System.out.println("Usuário encontrado no banco: " + (user != null ? user.getLogin() : "NULL"));

                if (user != null) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    login, null, Collections.emptyList()
                            );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Autenticação definida no contexto para: " + login);
                }

            } catch (Exception e) {
                System.out.println("Erro ao processar token: " + e.getMessage());
            }
        } else {
            System.out.println("Sem token ou token inválido");
        }

        filterChain.doFilter(request, response);
    }
}
