package com.javalovers.core.donor.mapper;

import com.javalovers.core.donor.domain.dto.request.DonorFormDTO;
import com.javalovers.core.donor.domain.entity.Donor;
import org.springframework.stereotype.Service;

@Service
public class DonorCreateMapper {

    public Donor convert(DonorFormDTO donorFormDTO){
        Donor donor = new Donor();
        donor.setName(donorFormDTO.name());
        donor.setCpfCnpj(donorFormDTO.cpfCnpj());
        donor.setContact(donorFormDTO.contact());

        return donor;
    }
}
