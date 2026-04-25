package com.javalovers.core.card.controller;

import com.javalovers.common.utils.HttpUtils;
import com.javalovers.core.card.dto.request.CardFilterDTO;
import com.javalovers.core.card.dto.request.CardFormDTO;
import com.javalovers.core.card.dto.response.CardDTO;
import com.javalovers.core.card.entity.Card;
import com.javalovers.core.card.service.CardService;
import com.javalovers.core.card.service.CardPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/card")
public class CardController {

    private final CardService cardService;
    private final CardPdfService cardPdfService;

    @GetMapping
    public ResponseEntity<Page<CardDTO>> listPaged(Pageable pageable, CardFilterDTO cardFilterDTO) {
        Page<Card> cardPage = cardService.list(pageable, cardFilterDTO);
        Page<CardDTO> cardDTOPage = cardService.generateCardDTOPage(cardPage);

        return ResponseEntity.ok(cardDTOPage);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CardDTO>> list(CardFilterDTO cardFilterDTO) {
        List<Card> cardList = cardService.list(cardFilterDTO);
        List<CardDTO> cardDTOList = cardService.generateCardDTOList(cardList);

        return ResponseEntity.ok(cardDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> get(@PathVariable Long id) {
        Card card = cardService.getOrNull(id);
        if(card == null) return ResponseEntity.notFound().build();

        CardDTO cardDTO = cardService.generateCardDTO(card);

        return ResponseEntity.ok(cardDTO);
    }

    @PostMapping
    public ResponseEntity<CardDTO> create(@RequestBody @Valid CardFormDTO cardFormDTO, UriComponentsBuilder uriComponentsBuilder) {
        Card card = cardService.generateCard(cardFormDTO);
        cardService.save(card);

        URI uri = HttpUtils.createURI(uriComponentsBuilder, "card", card.getCardId());

        return ResponseEntity.created(uri).body(cardService.generateCardDTO(card));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid CardFormDTO cardFormDTO) {
        Card card = cardService.getOrNull(id);
        if(card == null) return ResponseEntity.notFound().build();

        cardService.updateCard(card, cardFormDTO);

        cardService.save(card);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Card card = cardService.getOrNull(id);
        if(card == null) return ResponseEntity.notFound().build();

        cardService.delete(card);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate/{beneficiaryId}")
    public ResponseEntity<byte[]> generateCardForBeneficiary(@PathVariable Long beneficiaryId) {
        try {
            // Gerar o cartão no banco de dados
            Card card = cardService.generateCardForBeneficiary(beneficiaryId);
            
            // Gerar PDF do cartão
            byte[] pdfBytes = cardPdfService.generateCardPdf(beneficiaryId);
            
            // Configurar headers para download do PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "cartao_beneficiario_" + beneficiaryId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

