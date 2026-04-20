package com.javalovers.core.card.mapper;

import com.javalovers.core.card.dto.request.CardFormDTO;
import com.javalovers.core.card.entity.Card;
import org.springframework.stereotype.Service;

@Service
public class CardUpdateMapper {

    public void update(Card card, CardFormDTO cardFormDTO) {
        card.setUniqueNumber(cardFormDTO.uniqueNumber());
        card.setBeneficiaryId(cardFormDTO.beneficiaryId());
    }
}
