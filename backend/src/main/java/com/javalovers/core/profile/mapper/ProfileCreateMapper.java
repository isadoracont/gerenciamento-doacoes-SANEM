package com.javalovers.core.profile.mapper;

import com.javalovers.core.profile.domain.dto.request.ProfileFormDTO;
import com.javalovers.core.profile.domain.entity.Profile;
import org.springframework.stereotype.Service;

@Service
public class ProfileCreateMapper {

    public Profile convert(ProfileFormDTO profileFormDTO){
        Profile profile = new Profile();
        profile.setDescription(profileFormDTO.description());
        profile.setName(profileFormDTO.name());

        return profile;
    }
}
