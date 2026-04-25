package com.javalovers.core.profile.mapper;

import com.javalovers.core.profile.domain.dto.response.ProfileDTO;
import com.javalovers.core.profile.domain.entity.Profile;
import org.springframework.stereotype.Service;

@Service
public class ProfileDTOMapper {

    public ProfileDTO convert(Profile profile) {
        if(profile == null) return null;
        return new ProfileDTO(
                profile.getProfileId(),
                profile.getDescription(),
                profile.getName()
        );
    }

}
