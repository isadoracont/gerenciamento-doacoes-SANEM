package com.javalovers.core.donation.controller;

import com.javalovers.core.donation.domain.dto.request.DonationFormDTO;
import com.javalovers.core.donation.domain.dto.response.DonationDTO;
import com.javalovers.core.donation.service.DonationService;
import com.javalovers.core.donor.domain.entity.Donor;
import com.javalovers.core.donor.service.DonorService;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.appuser.service.AppUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/donation")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;
    private final DonorService donorService;
    private final AppUserService userService;

    @PostMapping
    public ResponseEntity<DonationDTO> create(@Valid @RequestBody DonationFormDTO formDTO) {
        Donor donor = donorService.getOrThrowException(formDTO.donorId());
        AppUser user = userService.getOrThrowException(formDTO.receiverUserId());

        DonationDTO donationCriada = donationService.create(formDTO, donor, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(donationCriada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationDTO> findById(@PathVariable Long id) {
        DonationDTO donation = donationService.findById(id);

        return ResponseEntity.ok(donation);
    }

    @GetMapping
    public ResponseEntity<List<DonationDTO>> findAll() {
        List<DonationDTO> allDonations = donationService.findAll();

        return ResponseEntity.ok(allDonations);
    }

}
