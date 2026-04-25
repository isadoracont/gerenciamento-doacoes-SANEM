package com.javalovers.core.withdrawal.service;

import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.common.specification.SpecificationHelper;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import com.javalovers.core.withdrawal.domain.dto.request.WithdrawalFilterDTO;
import com.javalovers.core.withdrawal.domain.dto.request.WithdrawalFormDTO;
import com.javalovers.core.withdrawal.domain.dto.response.WithdrawalDTO;
import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import com.javalovers.core.withdrawal.mapper.WithdrawalCreateMapper;
import com.javalovers.core.withdrawal.mapper.WithdrawalDTOMapper;
import com.javalovers.core.withdrawal.mapper.WithdrawalUpdateMapper;
import com.javalovers.core.withdrawal.repository.WithdrawalRepository;
import com.javalovers.core.withdrawal.specification.WithdrawalSpecification;
import com.javalovers.core.withdrawallimit.service.WithdrawalLimitConfigService;
import com.javalovers.core.beneficiary.service.BeneficiaryService;
import com.javalovers.core.item.service.ItemService;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.itemwithdrawn.domain.entity.ItemWithdrawn;
import com.javalovers.core.itemwithdrawn.repository.ItemWithdrawnRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WithdrawalService {

    private final WithdrawalRepository withdrawalRepository;
    private final WithdrawalCreateMapper withdrawalCreateMapper;
    private final WithdrawalDTOMapper withdrawalDTOMapper;
    private final WithdrawalUpdateMapper withdrawalUpdateMapper;
    private final WithdrawalLimitConfigService limitConfigService;
    private final BeneficiaryService beneficiaryService;
    private final ItemService itemService;
    private final ItemWithdrawnRepository itemWithdrawnRepository;
    private final EntityManager entityManager;

    public Withdrawal generateWithdrawal(WithdrawalFormDTO withdrawalFormDTO, Beneficiary beneficiary, AppUser attendantUser) {
        return withdrawalCreateMapper.convert(withdrawalFormDTO, beneficiary, attendantUser);
    }

    @Transactional
    public void save (Withdrawal withdrawal, WithdrawalFormDTO withdrawalFormDTO) {
        // Validar limite antes de processar itens
        if (withdrawalFormDTO != null && withdrawalFormDTO.items() != null && !withdrawalFormDTO.items().isEmpty()) {
            validateWithdrawalLimit(withdrawal, withdrawalFormDTO.items());
        } else {
            validateWithdrawalLimit(withdrawal);
        }
        
        // Salvar withdrawal primeiro para ter o ID
        withdrawalRepository.save(withdrawal);
        
        // Processar itens após salvar (precisa do ID do withdrawal)
        if (withdrawalFormDTO != null && withdrawalFormDTO.items() != null && !withdrawalFormDTO.items().isEmpty()) {
            processWithdrawalItems(withdrawal, withdrawalFormDTO.items());
        }
        
        // Atualizar contador de retiradas do beneficiário
        updateBeneficiaryWithdrawalCount(withdrawal, withdrawalFormDTO);
    }

    @Transactional
    public void save (Withdrawal withdrawal) {
        validateWithdrawalLimit(withdrawal);
        withdrawalRepository.save(withdrawal);
        
        // Atualizar contador de retiradas do beneficiário (sem DTO, calcula do withdrawal salvo)
        updateBeneficiaryWithdrawalCount(withdrawal, null);
    }

    private void processWithdrawalItems(Withdrawal withdrawal, List<WithdrawalFormDTO.WithdrawalItemDTO> items) {
        for (WithdrawalFormDTO.WithdrawalItemDTO itemDTO : items) {
            Item item = itemService.getOrThrowException(itemDTO.itemId());
            
            // Validar estoque disponível
            if (item.getStockQuantity() < itemDTO.quantity()) {
                throw new IllegalStateException(
                    String.format("Estoque insuficiente para o item '%s'. Disponível: %d, Solicitado: %d",
                        item.getDescription(), item.getStockQuantity(), itemDTO.quantity())
                );
            }
            
            // Decrementar estoque
            item.setStockQuantity(item.getStockQuantity() - itemDTO.quantity());
            itemService.save(item);
            
            // Criar registro de item retirado
            ItemWithdrawn itemWithdrawn = new ItemWithdrawn();
            itemWithdrawn.setWithdrawal(withdrawal);
            itemWithdrawn.setItem(item);
            itemWithdrawn.setQuantity(itemDTO.quantity());
            itemWithdrawnRepository.save(itemWithdrawn);
        }
    }

    public void validateWithdrawalLimit(Withdrawal withdrawal) {
        validateWithdrawalLimit(withdrawal, null);
    }

    public void validateWithdrawalLimit(Withdrawal withdrawal, List<WithdrawalFormDTO.WithdrawalItemDTO> items) {
        if (withdrawal.getBeneficiary() == null) {
            return;
        }

        Long beneficiaryId = withdrawal.getBeneficiary().getBeneficiaryId();
        var beneficiary = beneficiaryService.getOrThrowException(beneficiaryId);
        
        // Usar limite do beneficiário se configurado, senão usar limite global
        Integer monthlyLimit = beneficiary.getWithdrawalLimit() != null 
            ? beneficiary.getWithdrawalLimit() 
            : limitConfigService.getActiveConfig().getMonthlyItemLimit();

        // Se não houver limite configurado, não validar
        if (monthlyLimit == null || monthlyLimit <= 0) {
            return;
        }

        // Usar contador do beneficiário ou calcular do banco
        int currentWithdrawals = beneficiary.getCurrentWithdrawalsThisMonth() != null 
            ? beneficiary.getCurrentWithdrawalsThisMonth() 
            : calculateItemsWithdrawnThisMonth(beneficiaryId);

        // Calcular quantidade de itens nesta retirada
        int itemsInThisWithdrawal = 0;
        if (items != null && !items.isEmpty()) {
            itemsInThisWithdrawal = items.stream()
                .mapToInt(WithdrawalFormDTO.WithdrawalItemDTO::quantity)
                .sum();
        } else {
            itemsInThisWithdrawal = calculateItemsInWithdrawal(withdrawal);
        }

        if (currentWithdrawals + itemsInThisWithdrawal > monthlyLimit) {
            throw new IllegalStateException(
                String.format("Limite mensal excedido. Retiradas este mês: %d/%d. Tentativa de retirar mais %d itens.",
                    currentWithdrawals, monthlyLimit, itemsInThisWithdrawal)
            );
        }
    }

    private void updateBeneficiaryWithdrawalCount(Withdrawal withdrawal, WithdrawalFormDTO withdrawalFormDTO) {
        if (withdrawal.getBeneficiary() == null) {
            return;
        }

        Long beneficiaryId = withdrawal.getBeneficiary().getBeneficiaryId();
        var beneficiary = beneficiaryService.getOrThrowException(beneficiaryId);
        
        // Calcular quantidade de itens nesta retirada
        int itemsInThisWithdrawal = 0;
        if (withdrawalFormDTO != null && withdrawalFormDTO.items() != null && !withdrawalFormDTO.items().isEmpty()) {
            itemsInThisWithdrawal = withdrawalFormDTO.items().stream()
                .mapToInt(WithdrawalFormDTO.WithdrawalItemDTO::quantity)
                .sum();
        } else {
            itemsInThisWithdrawal = calculateItemsInWithdrawal(withdrawal);
        }
        
        // Atualizar contador
        int currentCount = beneficiary.getCurrentWithdrawalsThisMonth() != null 
            ? beneficiary.getCurrentWithdrawalsThisMonth() 
            : 0;
        
        beneficiary.setCurrentWithdrawalsThisMonth(currentCount + itemsInThisWithdrawal);
        beneficiaryService.save(beneficiary);
    }

    private int calculateItemsWithdrawnThisMonth(Long beneficiaryId) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = calendar.getTime();

        Query query = entityManager.createNativeQuery(
            "SELECT COALESCE(SUM(iw.quantity), 0) " +
            "FROM item_withdrawn iw " +
            "INNER JOIN withdrawal w ON iw.withdrawal_id = w.withdrawal_id " +
            "WHERE w.beneficiary_id = ? " +
            "AND w.withdrawal_date >= ? " +
            "AND w.deleted_at IS NULL " +
            "AND iw.deleted_at IS NULL"
        );
        query.setParameter(1, beneficiaryId);
        query.setParameter(2, startOfMonth);

        Object result = query.getSingleResult();
        return ((Number) result).intValue();
    }

    private int calculateItemsInWithdrawal(Withdrawal withdrawal) {
        if (withdrawal.getWithdrawalId() == null) {
            // Nova retirada - buscar itens do ItemWithdrawn que ainda não foram salvos
            // Por enquanto, assumimos que os itens serão adicionados depois
            // Esta validação será feita no controller quando os itens forem adicionados
            return 0;
        }

        Query query = entityManager.createNativeQuery(
            "SELECT COALESCE(SUM(quantity), 0) FROM item_withdrawn WHERE withdrawal_id = ? AND deleted_at IS NULL"
        );
        query.setParameter(1, withdrawal.getWithdrawalId());

        Object result = query.getSingleResult();
        return ((Number) result).intValue();
    }

    public int getItemsWithdrawnThisMonth(Long beneficiaryId) {
        return calculateItemsWithdrawnThisMonth(beneficiaryId);
    }

    public int getMonthlyLimit() {
        return limitConfigService.getActiveConfig().getMonthlyItemLimit();
    }

    public int getMonthlyLimit(Long beneficiaryId) {
        var beneficiary = beneficiaryService.getOrThrowException(beneficiaryId);
        return beneficiary.getWithdrawalLimit() != null
            ? beneficiary.getWithdrawalLimit()
            : limitConfigService.getActiveConfig().getMonthlyItemLimit();
    }

    public WithdrawalDTO generateWithdrawalDTO(Withdrawal withdrawal) {
        return withdrawalDTOMapper.convert(withdrawal);
    }

    public Withdrawal getOrNull(Long id){
        return withdrawalRepository.findById(id).orElse(null);
    }

    public void updateWithdrawal(Withdrawal withdrawal, WithdrawalFormDTO withdrawalFormDTO, Beneficiary beneficiary, AppUser attendantUser) {
        withdrawalUpdateMapper.update(withdrawal, withdrawalFormDTO, beneficiary, attendantUser);
    }

    @Transactional
    public void delete(Withdrawal withdrawal) {
        Long withdrawalId = withdrawal.getWithdrawalId();
        
        // Soft delete dos registros em item_withdrawn que referenciam este withdrawal
        Query deleteItemWithdrawnQuery = entityManager.createNativeQuery(
            "UPDATE item_withdrawn SET deleted_at = NOW() WHERE withdrawal_id = ? AND deleted_at IS NULL"
        );
        deleteItemWithdrawnQuery.setParameter(1, withdrawalId);
        deleteItemWithdrawnQuery.executeUpdate();
        
        // Soft delete do withdrawal
        withdrawal.softDelete();
        withdrawalRepository.save(withdrawal);
    }

    public List<Withdrawal> list(WithdrawalFilterDTO withdrawalFilterDTO) {
        Specification<Withdrawal> withdrawalSpecification = generateSpecification(withdrawalFilterDTO);
        return withdrawalRepository.findAll(withdrawalSpecification);
    }

    public Page<Withdrawal> list(Pageable pageable, WithdrawalFilterDTO withdrawalFilterDTO) {
        Specification<Withdrawal> withdrawalSpecification = generateSpecification(withdrawalFilterDTO);
        return withdrawalRepository.findAll(withdrawalSpecification, pageable);
    }

    private Specification<Withdrawal> generateSpecification(WithdrawalFilterDTO withdrawalFilterDTO) {
        SearchCriteria<Long> beneficiaryCriteria = SpecificationHelper.generateEqualsCriteria("beneficiary.id", withdrawalFilterDTO.beneficiaryId());
        SearchCriteria<Long> attendantUserCriteria = SpecificationHelper.generateEqualsCriteria("attendantUserId.id", withdrawalFilterDTO.attendantUserId());
        SearchCriteria<Date> withdrawalDateCriteria = SpecificationHelper.generateEqualsCriteria("withdrawalDate", withdrawalFilterDTO.withdrawalDate());

        Specification<Withdrawal> beneficiarySpecification = new WithdrawalSpecification(beneficiaryCriteria);
        Specification<Withdrawal> attendantSpecification = new WithdrawalSpecification(attendantUserCriteria);
        Specification<Withdrawal> withdrawalDateSpecification = new WithdrawalSpecification(withdrawalDateCriteria);
        
        // Filtro para excluir registros deletados (soft delete)
        Specification<Withdrawal> notDeletedSpecification = (root, query, criteriaBuilder) -> 
            criteriaBuilder.isNull(root.get("deletedAt"));

        return Specification.where(beneficiarySpecification)
                .and(attendantSpecification)
                .and(withdrawalDateSpecification)
                .and(notDeletedSpecification);
    }

    public Page<WithdrawalDTO> generateWithdrawalDTOPage(Page<Withdrawal> withdrawalPage) {
        return withdrawalPage.map(this::generateWithdrawalDTO);
    }

    public List<WithdrawalDTO> generateWithdrawalDTOList(List<Withdrawal> withdrawalList) {
        return withdrawalList.stream().map(withdrawalDTOMapper::convert).toList();
    }

}
