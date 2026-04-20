package com.javalovers.core.donor.service;

import com.javalovers.common.exception.EntityNotFoundException;
import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.common.specification.SpecificationHelper;
import com.javalovers.core.donor.domain.dto.request.DonorFilterDTO;
import com.javalovers.core.donor.domain.dto.request.DonorFormDTO;
import com.javalovers.core.donor.domain.dto.response.DonorDTO;
import com.javalovers.core.donor.domain.entity.Donor;
import com.javalovers.core.donor.mapper.DonorCreateMapper;
import com.javalovers.core.donor.mapper.DonorDTOMapper;
import com.javalovers.core.donor.mapper.DonorUpdateMapper;
import com.javalovers.core.donor.repository.DonorRepository;
import com.javalovers.core.donor.specification.DonorSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;
    private final DonorCreateMapper donorCreateMapper;
    private final DonorDTOMapper donorDTOMapper;
    private final DonorUpdateMapper donorUpdateMapper;

    public Donor generateDonor(DonorFormDTO donorFormDTO) {
        return donorCreateMapper.convert(donorFormDTO);
    }

    public void save (Donor donor) {
        donorRepository.save(donor);
    }

    public DonorDTO generateDonorDTO(Donor donor) {
        return donorDTOMapper.convert(donor);
    }

    public Donor getOrNull(Long id){
        return donorRepository.findById(id).orElse(null);
    }

    public void updateDonor(Donor donor, DonorFormDTO donorFormDTO) {
        donorUpdateMapper.update(donor, donorFormDTO);
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Donor donor) {
        donor.softDelete();
        donorRepository.save(donor);
    }

    public List<Donor> list(DonorFilterDTO donorFilterDTO) {
        Specification<Donor> donorSpecification = generateSpecification(donorFilterDTO);
        return donorRepository.findAll(donorSpecification);
    }

    public Page<Donor> list(Pageable pageable, DonorFilterDTO donorFilterDTO) {
        Specification<Donor> donorSpecification = generateSpecification(donorFilterDTO);
        return donorRepository.findAll(donorSpecification, pageable);
    }

    private Specification<Donor> generateSpecification(DonorFilterDTO donorFilterDTO) {
        SearchCriteria<String> nameCriteria = SpecificationHelper.generateInnerLikeCriteria("name", donorFilterDTO.name());
        SearchCriteria<String> cpfCnpjCriteria = SpecificationHelper.generateInnerLikeCriteria("cpfCnpj", donorFilterDTO.cpfCnpj());
        SearchCriteria<String> contactCriteria = SpecificationHelper.generateInnerLikeCriteria("contact", donorFilterDTO.contact());

        Specification<Donor> nameSpecification = new DonorSpecification(nameCriteria);
        Specification<Donor> cpfCnpjSpecification = new DonorSpecification(cpfCnpjCriteria);
        Specification<Donor> contactSpecification = new DonorSpecification(contactCriteria);
        
        // Filtro para excluir registros deletados (soft delete)
        Specification<Donor> notDeletedSpecification = (root, query, criteriaBuilder) -> 
            criteriaBuilder.isNull(root.get("deletedAt"));

        return Specification.where(nameSpecification)
                .and(cpfCnpjSpecification)
                .and(contactSpecification)
                .and(notDeletedSpecification);
    }

    public Page<DonorDTO> generateDonorDTOPage(Page<Donor> itemPage) {
        return itemPage.map(this::generateDonorDTO);
    }

    public List<DonorDTO> generateDonorList(List<Donor> itemList) {
        return itemList.stream().map(donorDTOMapper::convert).toList();
    }

    public Donor getOrThrowException(Long id) {
        return donorRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Donor", id)
        );
    }

}
