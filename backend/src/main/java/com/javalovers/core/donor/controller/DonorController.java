package com.javalovers.core.donor.controller;

import com.javalovers.common.utils.HttpUtils;
import com.javalovers.core.donor.domain.dto.request.DonorFilterDTO;
import com.javalovers.core.donor.domain.dto.request.DonorFormDTO;
import com.javalovers.core.donor.domain.dto.response.DonorDTO;
import com.javalovers.core.donor.domain.entity.Donor;
import com.javalovers.core.donor.service.DonorService;
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
@RequestMapping("/donor")
public class DonorController {

    private final DonorService donorService;

    @GetMapping
    public ResponseEntity<Page<DonorDTO>> listPaged(Pageable pageable, DonorFilterDTO donorFilterDTO) {
        Page<Donor> donorPage = donorService.list(pageable, donorFilterDTO);
        Page<DonorDTO> donorDTOPage = donorService.generateDonorDTOPage(donorPage);

        return ResponseEntity.ok(donorDTOPage);
    }

    @GetMapping("/all")
    public ResponseEntity<List<DonorDTO>> list(DonorFilterDTO donorFilterDTO) {
        List<Donor> donorList = donorService.list(donorFilterDTO);
        List<DonorDTO> donorDTOList = donorService.generateDonorList(donorList);

        return ResponseEntity.ok(donorDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonorDTO> get(@PathVariable Long id) {
        Donor donor = donorService.getOrNull(id);
        if(donor == null) return ResponseEntity.notFound().build();

        DonorDTO donorDTO = donorService.generateDonorDTO(donor);

        return ResponseEntity.ok(donorDTO);
    }

    @PostMapping
    public ResponseEntity<DonorDTO> create(@RequestBody @Valid DonorFormDTO donorFormDTO, UriComponentsBuilder uriComponentsBuilder) {
        Donor donor = donorService.generateDonor(donorFormDTO);
        donorService.save(donor);

        URI uri = HttpUtils.createURI(uriComponentsBuilder, "donor", donor.getDonorId());

        return ResponseEntity.created(uri).body(donorService.generateDonorDTO(donor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid DonorFormDTO donorFormDTO) {
        Donor donor = donorService.getOrNull(id);
        if(donor == null) return ResponseEntity.notFound().build();

        donorService.updateDonor(donor, donorFormDTO);

        donorService.save(donor);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Donor donor = donorService.getOrNull(id);
        if(donor == null) return ResponseEntity.notFound().build();

        donorService.delete(donor);

        return ResponseEntity.noContent().build();
    }
}
