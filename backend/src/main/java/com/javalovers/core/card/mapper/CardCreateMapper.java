package com.javalovers.core.card.mapper;

import com.javalovers.core.card.dto.request.CardFormDTO;
import com.javalovers.core.card.entity.Card;
import org.springframework.stereotype.Service;

@Service
public class CardCreateMapper {

    public Card convert(CardFormDTO cardFormDTO) {
        Card card = new Card();
        card.setUniqueNumber(cardFormDTO.uniqueNumber());
        card.setBeneficiaryId(cardFormDTO.beneficiaryId());

        return card;
    }

}
