package com.javalovers.core.profile.service;

import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.common.specification.SpecificationHelper;
import com.javalovers.core.profile.domain.dto.request.ProfileFilterDTO;
import com.javalovers.core.profile.domain.dto.request.ProfileFormDTO;
import com.javalovers.core.profile.domain.dto.response.ProfileDTO;
import com.javalovers.core.profile.domain.entity.Profile;
import com.javalovers.core.profile.mapper.ProfileCreateMapper;
import com.javalovers.core.profile.mapper.ProfileDTOMapper;
import com.javalovers.core.profile.mapper.ProfileUpdateMapper;
import com.javalovers.core.profile.repository.ProfileRepository;
import com.javalovers.core.profile.specification.ProfileSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileCreateMapper profileCreateMapper;
    private final ProfileDTOMapper profileDTOMapper;
    private final ProfileUpdateMapper profileUpdateMapper;

    public Profile generateProfile(ProfileFormDTO profileFormDTO) {
        return profileCreateMapper.convert(profileFormDTO);
    }

    public void save (Profile profile) {
        profileRepository.save(profile);
    }

    public ProfileDTO generateProfileDTO(Profile profile) {
        return profileDTOMapper.convert(profile);
    }

    public Profile getOrNull(Long id){
        return profileRepository.findById(id).orElse(null);
    }

    public void updateProfile(Profile profile, ProfileFormDTO profileFormDTO) {
        profileUpdateMapper.update(profile, profileFormDTO);
    }

    public void delete(Profile profile) {
        profileRepository.delete(profile);
    }

    public List<Profile> list(ProfileFilterDTO profileFilterDTO) {
        Specification<Profile> profileSpecification = generateSpecification(profileFilterDTO);
        return profileRepository.findAll(profileSpecification);
    }

    public Page<Profile> list(Pageable pageable, ProfileFilterDTO profileFilterDTO) {
        Specification<Profile> profileSpecification = generateSpecification(profileFilterDTO);
        return profileRepository.findAll(profileSpecification, pageable);
    }

    private Specification<Profile> generateSpecification(ProfileFilterDTO profileFilterDTO) {
        SearchCriteria<String> descriptionCriteria = SpecificationHelper.generateInnerLikeCriteria("description", profileFilterDTO.description());
        SearchCriteria<String> nameCriteria = SpecificationHelper.generateInnerLikeCriteria("name", profileFilterDTO.name());

        Specification<Profile> descriptionSpecification = new ProfileSpecification(descriptionCriteria);
        Specification<Profile> nameSpecification = new ProfileSpecification(nameCriteria);

        return Specification.where(descriptionSpecification)
                .and(nameSpecification);
    }

    public Page<ProfileDTO> generateProfileDTOPage(Page<Profile> profilePage) {
        return profilePage.map(this::generateProfileDTO);
    }

    public List<ProfileDTO> generateProfileDTOList(List<Profile> profileList) {
        return profileList.stream().map(profileDTOMapper::convert).toList();
    }

//    public Profile getOrThrowException(Long id) {
//        return profileRepository.findById(id).orElseThrow(
//                () -> new EntityNotFoundException("Profile", id)
//        );
//    }

}
