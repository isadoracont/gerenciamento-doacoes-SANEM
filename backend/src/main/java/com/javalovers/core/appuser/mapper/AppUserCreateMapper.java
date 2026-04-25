package com.javalovers.core.appuser.mapper;

import com.javalovers.core.appuser.domain.dto.request.AppUserFormDTO;
import com.javalovers.core.appuser.domain.entity.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserCreateMapper {

    private final PasswordEncoder passwordEncoder;

    public AppUser convert(AppUserFormDTO appUserFormDTO) {
        AppUser user = new AppUser();
        user.setName(appUserFormDTO.name());
        user.setEmail(appUserFormDTO.email());
        user.setLogin(appUserFormDTO.login());
        user.setPasswordHash(passwordEncoder.encode(appUserFormDTO.password()));
        user.setStatus(appUserFormDTO.status());
        user.setProfile(appUserFormDTO.profile());

        return user;
    }
}
