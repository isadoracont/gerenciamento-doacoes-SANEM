package com.javalovers.core.donor.mapper;

import com.javalovers.core.donor.domain.dto.request.DonorFormDTO;
import com.javalovers.core.donor.domain.entity.Donor;
import org.springframework.stereotype.Service;

@Service
public class DonorUpdateMapper {

    public void update(Donor donor, DonorFormDTO donorFormDTO){
        donor.setName(donorFormDTO.name());
        donor.setCpfCnpj(donorFormDTO.cpfCnpj());
        donor.setContact(donorFormDTO.contact());
        donor.setEmail(donorFormDTO.email());
        donor.setStreetAddress(donorFormDTO.streetAddress());
        donor.setNumberAddress(donorFormDTO.numberAddress());
        donor.setDetailsAddress(donorFormDTO.detailsAddress());
        donor.setNbAddress(donorFormDTO.nbAddress());
        donor.setCep(donorFormDTO.cep());
    }
}
