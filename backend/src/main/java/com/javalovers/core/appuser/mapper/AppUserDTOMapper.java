package com.javalovers.core.appuser.mapper;

import com.javalovers.core.appuser.domain.dto.response.AppUserDTO;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.profile.domain.dto.response.ProfileDTO;
import com.javalovers.core.profile.mapper.ProfileDTOMapper;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AppUserDTOMapper {

    private final ProfileDTOMapper profileDTOMapper;

    public AppUserDTO convert(AppUser user) {
        if (user == null)
            return null;
        ProfileDTO profileDTO = user.getProfile() != null 
            ? profileDTOMapper.convert(user.getProfile()) 
            : null;
        return new AppUserDTO(
                user.getUserId(),
                user.getName(),
                user.getLogin(),
                user.getEmail(),
                user.getStatus(),
                profileDTO);
    }
}
