package com.javalovers.core.profile.controller;

import com.javalovers.common.utils.HttpUtils;
import com.javalovers.core.profile.domain.dto.request.ProfileFilterDTO;
import com.javalovers.core.profile.domain.dto.request.ProfileFormDTO;
import com.javalovers.core.profile.domain.dto.response.ProfileDTO;
import com.javalovers.core.profile.domain.entity.Profile;
import com.javalovers.core.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<Page<ProfileDTO>> listPaged(Pageable pageable, ProfileFilterDTO profileFilterDTO) {
        Page<Profile> profilePage = profileService.list(pageable, profileFilterDTO);
        Page<ProfileDTO> profileDTOPage = profileService.generateProfileDTOPage(profilePage);

        return ResponseEntity.ok(profileDTOPage);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProfileDTO>> list(ProfileFilterDTO profileFilterDTO) {
        List<Profile> profileList = profileService.list(profileFilterDTO);
        List<ProfileDTO> profileDTOList = profileService.generateProfileDTOList(profileList);

        return ResponseEntity.ok(profileDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> get(@PathVariable Long id) {
        Profile profile = profileService.getOrNull(id);
        if(profile == null) return ResponseEntity.notFound().build();

        ProfileDTO profileDTO = profileService.generateProfileDTO(profile);

        return ResponseEntity.ok(profileDTO);
    }

    @PostMapping
    public ResponseEntity<ProfileDTO> create(@RequestBody @Valid ProfileFormDTO profileFormDTO, UriComponentsBuilder uriComponentsBuilder) {
        Profile profile = profileService.generateProfile(profileFormDTO);
        profileService.save(profile);

        URI uri = HttpUtils.createURI(uriComponentsBuilder, "profile", profile.getProfileId());

        return ResponseEntity.created(uri).body(profileService.generateProfileDTO(profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid ProfileFormDTO profileFormDTO) {
        Profile profile = profileService.getOrNull(id);
        if(profile == null) return ResponseEntity.notFound().build();

        profileService.updateProfile(profile, profileFormDTO);

        profileService.save(profile);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Profile profile = profileService.getOrNull(id);
        if(profile == null) return ResponseEntity.notFound().build();

        profileService.delete(profile);

        return ResponseEntity.noContent().build();
    }
}

