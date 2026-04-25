package com.javalovers.core.donor.mapper;

import com.javalovers.core.donor.domain.dto.response.DonorDTO;
import com.javalovers.core.donor.domain.entity.Donor;
import org.springframework.stereotype.Service;

@Service
public class DonorDTOMapper {

    public DonorDTO convert(Donor donor){
        if(donor == null) return null;
        return new DonorDTO(
                donor.getDonorId(),
                donor.getName(),
                donor.getCpfCnpj(),
                donor.getContact()
        );
    }
}
