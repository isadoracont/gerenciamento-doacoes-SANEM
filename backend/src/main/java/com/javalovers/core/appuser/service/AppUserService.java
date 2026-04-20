package com.javalovers.core.appuser.service;

import com.javalovers.common.exception.EntityNotFoundException;
import com.javalovers.core.appuser.domain.dto.request.AppUserFormDTO;
import com.javalovers.core.appuser.domain.dto.request.AppUserUpdateDTO;
import com.javalovers.core.appuser.domain.dto.response.AppUserDTO;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.appuser.mapper.AppUserCreateMapper;
import com.javalovers.core.appuser.mapper.AppUserDTOMapper;
import com.javalovers.core.appuser.mapper.AppUserUpdateMapper;
import com.javalovers.core.appuser.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final AppUserCreateMapper appUserCreateMapper;
    private final AppUserDTOMapper appUserDTOMapper;
    private final AppUserUpdateMapper appUserUpdateMapper;

    public AppUser generateUser(AppUserFormDTO appUserFormDTO) {
        return appUserCreateMapper.convert(appUserFormDTO);
    }

    public void save (AppUser user) {
        appUserRepository.save(user);
    }

    public AppUserDTO generateUserDTO(AppUser user) {
        return appUserDTOMapper.convert(user);
    }

    public AppUser getOrNull(Long id){
        return appUserRepository.findById(id).orElse(null);
    }

    public void updateUser(AppUser user, AppUserFormDTO appUserFormDTO) {
        appUserUpdateMapper.update(user, appUserFormDTO);
    }

    public void updateUser(AppUser user, AppUserUpdateDTO appUserUpdateDTO) {
        appUserUpdateMapper.update(user, appUserUpdateDTO);
    }

    public void delete(AppUser user) {
        appUserRepository.delete(user);
    }

    public List<AppUser> list() {
        return appUserRepository.findAll();
    }

    public Page<AppUser> list(Pageable pageable) {
        return appUserRepository.findAll(pageable);
    }

    public Page<AppUserDTO> generateUserDTOPage(Page<AppUser> userPage) {
        return userPage.map(this::generateUserDTO);
    }

    public List<AppUserDTO> generateUserDTOList(List<AppUser> userList) {
        return userList.stream().map(appUserDTOMapper::convert).toList();
    }

    public AppUser getOrThrowException(Long id) {
        return appUserRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("User", id)
        );
    }

}