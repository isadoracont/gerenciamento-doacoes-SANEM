package com.javalovers.core.card.service;

import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.common.specification.SpecificationHelper;
import com.javalovers.core.card.dto.request.CardFilterDTO;
import com.javalovers.core.card.dto.request.CardFormDTO;
import com.javalovers.core.card.dto.response.CardDTO;
import com.javalovers.core.card.entity.Card;
import com.javalovers.core.card.mapper.CardCreateMapper;
import com.javalovers.core.card.mapper.CardDTOMapper;
import com.javalovers.core.card.mapper.CardUpdateMapper;
import com.javalovers.core.card.repository.CardRepository;
import com.javalovers.core.card.specification.CardSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final CardCreateMapper cardCreateMapper;
    private final CardDTOMapper cardDTOMapper;
    private final CardUpdateMapper cardUpdateMapper;

    public Card generateCard(CardFormDTO cardFormDTO) {
        return cardCreateMapper.convert(cardFormDTO);
    }

    public void save (Card card) {
        cardRepository.save(card);
    }

    public CardDTO generateCardDTO(Card card) {
        return cardDTOMapper.convert(card);
    }

    public Card getOrNull(Long id){
        return cardRepository.findById(id).orElse(null);
    }

    public void updateCard(Card card, CardFormDTO cardFormDTO) {
        cardUpdateMapper.update(card, cardFormDTO);
    }

    @Transactional
    public void delete(Card card) {
        card.softDelete();
        cardRepository.save(card);
    }

    public List<Card> list(CardFilterDTO cardFilterDTO) {
        Specification<Card> cardSpecification = generateSpecification(cardFilterDTO);
        return cardRepository.findAll(cardSpecification);
    }

    public Page<Card> list(Pageable pageable, CardFilterDTO cardFilterDTO) {
        Specification<Card> cardSpecification = generateSpecification(cardFilterDTO);
        return cardRepository.findAll(cardSpecification, pageable);
    }

    private Specification<Card> generateSpecification(CardFilterDTO cardFilterDTO) {
        SearchCriteria<String> uniqueNumberCriteria = SpecificationHelper.generateInnerLikeCriteria("uniqueNumber", cardFilterDTO.uniqueNumber());
        SearchCriteria<Long> beneficiaryIdCriteria = SpecificationHelper.generateEqualsCriteria("beneficiaryId", cardFilterDTO.beneficiaryId());

        Specification<Card> uniqueNumberSpecification = new CardSpecification(uniqueNumberCriteria);
        Specification<Card> beneficiaryIdSpecification = new CardSpecification(beneficiaryIdCriteria);

        return Specification.where(uniqueNumberSpecification)
                .and(beneficiaryIdSpecification);
    }

    public Page<CardDTO> generateCardDTOPage(Page<Card> cardPage) {
        return cardPage.map(this::generateCardDTO);
    }

    public List<CardDTO> generateCardDTOList(List<Card> cardList) {
        return cardList.stream().map(cardDTOMapper::convert).toList();
    }

    @Transactional
    public Card generateCardForBeneficiary(Long beneficiaryId) {
        // Verificar se já existe cartão para este beneficiário
        Card existingCard = cardRepository.findByBeneficiaryId(beneficiaryId).orElse(null);
        if (existingCard != null) {
            throw new IllegalStateException("Beneficiário já possui um cartão");
        }

        // Gerar número único do cartão
        String uniqueNumber = generateUniqueCardNumber();
        
        // Garantir que o número seja único
        while (cardRepository.findByUniqueNumber(uniqueNumber).isPresent()) {
            uniqueNumber = generateUniqueCardNumber();
        }

        Card card = new Card();
        card.setUniqueNumber(uniqueNumber);
        card.setBeneficiaryId(beneficiaryId);
        card.setIssueDate(new Date());

        return cardRepository.save(card);
    }

    private String generateUniqueCardNumber() {
        // Gera um número único baseado em UUID (sem hífens) e timestamp
        String uuidPart = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        String timestampPart = String.valueOf(System.currentTimeMillis()).substring(7);
        return "CARD-" + uuidPart + timestampPart;
    }
}
