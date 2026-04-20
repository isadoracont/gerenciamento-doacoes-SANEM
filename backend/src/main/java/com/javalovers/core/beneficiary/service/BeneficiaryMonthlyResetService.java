package com.javalovers.core.beneficiary.service;

import com.javalovers.core.beneficiary.repository.BeneficiaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class BeneficiaryMonthlyResetService {

    private final BeneficiaryRepository beneficiaryRepository;

    /**
     * Reseta o contador de retiradas mensais de todos os beneficiários
     * Executa no primeiro dia de cada mês às 00:00:00
     */
    @Scheduled(cron = "0 0 0 1 * ?") // Primeiro dia de cada mês às 00:00:00
    @Transactional
    public void resetMonthlyWithdrawals() {
        log.info("Iniciando reset mensal de retiradas dos beneficiários...");
        
        try {
            int updatedCount = beneficiaryRepository.resetCurrentWithdrawalsThisMonth();
            log.info("Reset mensal concluído. {} beneficiários atualizados.", updatedCount);
        } catch (Exception e) {
            log.error("Erro ao resetar retiradas mensais dos beneficiários", e);
        }
    }
}





