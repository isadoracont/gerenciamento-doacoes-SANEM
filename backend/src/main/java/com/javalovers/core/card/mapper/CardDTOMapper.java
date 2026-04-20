package com.javalovers.core.card.mapper;

import com.javalovers.core.card.dto.response.CardDTO;
import com.javalovers.core.card.entity.Card;
import org.springframework.stereotype.Service;

@Service
public class CardDTOMapper {

    public CardDTO convert(Card card){
        if(card == null) return null;
        return new CardDTO(
                card.getCardId(),
                card.getUniqueNumber(),
                card.getBeneficiaryId(),
                card.getIssueDate()
        );
    }
}
