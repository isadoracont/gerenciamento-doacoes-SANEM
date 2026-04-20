package com.javalovers.core.donation.service;

import com.javalovers.common.exception.EntityNotFoundException;
import com.javalovers.core.donation.domain.dto.request.DonationFormDTO;
import com.javalovers.core.donation.domain.dto.response.DonationDTO;
import com.javalovers.core.donation.domain.entity.Donation;
import com.javalovers.core.donation.mapper.DonationCreateMapper;
import com.javalovers.core.donation.mapper.DonationDTOMapper;
import com.javalovers.core.donation.repository.DonationRepository;
import com.javalovers.core.donor.domain.entity.Donor;
import com.javalovers.core.appuser.domain.entity.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonationCreateMapper donationCreateMapper;
    private final DonationDTOMapper donationDTOMapper;

    @Transactional
    public DonationDTO create(DonationFormDTO formDTO, Donor donor, AppUser user) {
        Donation donation = donationCreateMapper.convert(formDTO, donor, user);
        Donation donationSalva = donationRepository.save(donation);

        return donationDTOMapper.convert(donationSalva);
    }

    @Transactional(readOnly = true)
    public DonationDTO findById(Long id) {
        return donationRepository.findById(id)
                .map(donationDTOMapper::convert)
                .orElseThrow(() -> new RuntimeException("Doação não encontrada com ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<DonationDTO> findAll() {
        return donationRepository.findAll()
                .stream()
                .map(donationDTOMapper::convert)
                .collect(Collectors.toList());
    }

    public Donation getOrThrowException(Long id) {
        return donationRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Donation", id)
        );
    }
}
