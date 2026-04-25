package com.javalovers.core.card.service;

import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import com.javalovers.core.beneficiary.service.BeneficiaryService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class CardPdfService {

    private final BeneficiaryService beneficiaryService;

    public byte[] generateCardPdf(Long beneficiaryId) throws IOException {
        Beneficiary beneficiary = beneficiaryService.getOrThrowException(beneficiaryId);
        
        // Criar documento PDF
        PDDocument document = new PDDocument();
        
        // Criar página no formato de cartão (85.6mm x 53.98mm - tamanho padrão de cartão)
        // Convertido para pontos: 243 x 153 pontos (1 ponto = 1/72 polegada)
        PDPage page = new PDPage(new PDRectangle(243, 153));
        document.addPage(page);
        
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            // Configurar fonte
            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            
            // Título
            contentStream.beginText();
            contentStream.setFont(fontBold, 14);
            contentStream.newLineAtOffset(20, 120);
            contentStream.showText("CARTÃO DE IDENTIFICAÇÃO");
            contentStream.endText();
            
            // Nome da organização
            contentStream.beginText();
            contentStream.setFont(fontBold, 12);
            contentStream.newLineAtOffset(20, 105);
            contentStream.showText("SANEM");
            contentStream.endText();
            
            // Nome do beneficiário
            contentStream.beginText();
            contentStream.setFont(fontRegular, 10);
            contentStream.newLineAtOffset(20, 80);
            contentStream.showText("Nome: " + beneficiary.getFullName());
            contentStream.endText();
            
            // CPF
            contentStream.beginText();
            contentStream.setFont(fontRegular, 10);
            contentStream.newLineAtOffset(20, 60);
            contentStream.showText("CPF: " + beneficiary.getCpf());
            contentStream.endText();
        }
        
        // Converter para byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();
        
        return baos.toByteArray();
    }
}





