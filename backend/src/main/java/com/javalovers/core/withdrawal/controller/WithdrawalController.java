package com.javalovers.core.withdrawal.controller;

import com.javalovers.common.utils.HttpUtils;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.appuser.service.AppUserService;
import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import com.javalovers.core.beneficiary.service.BeneficiaryService;
import com.javalovers.core.withdrawal.domain.dto.request.WithdrawalFilterDTO;
import com.javalovers.core.withdrawal.domain.dto.request.WithdrawalFormDTO;
import com.javalovers.core.withdrawal.domain.dto.response.WithdrawalDTO;
import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import com.javalovers.core.withdrawal.service.WithdrawalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/withdrawal")
public class WithdrawalController {

    private final WithdrawalService withdrawalService;
    private final BeneficiaryService beneficiaryService;
    private final AppUserService appUserService;

    @GetMapping
    public ResponseEntity<Page<WithdrawalDTO>> listPaged(Pageable pageable, WithdrawalFilterDTO withdrawalFilterDTO) {
        Page<Withdrawal> withdrawalPage = withdrawalService.list(pageable, withdrawalFilterDTO);
        Page<WithdrawalDTO> withdrawalDTOPage = withdrawalService.generateWithdrawalDTOPage(withdrawalPage);

        return ResponseEntity.ok(withdrawalDTOPage);
    }

    @GetMapping("/all")
    public ResponseEntity<List<WithdrawalDTO>> list(WithdrawalFilterDTO withdrawalFilterDTO) {
        List<Withdrawal> withdrawalList = withdrawalService.list(withdrawalFilterDTO);
        List<WithdrawalDTO> withdrawalDTOList = withdrawalService.generateWithdrawalDTOList(withdrawalList);

        return ResponseEntity.ok(withdrawalDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WithdrawalDTO> get(@PathVariable Long id) {
        Withdrawal withdrawal = withdrawalService.getOrNull(id);
        if(withdrawal == null) return ResponseEntity.notFound().build();

        WithdrawalDTO withdrawalDTO = withdrawalService.generateWithdrawalDTO(withdrawal);

        return ResponseEntity.ok(withdrawalDTO);
    }

    @PostMapping
    public ResponseEntity<WithdrawalDTO> create(@RequestBody @Valid WithdrawalFormDTO withdrawalFormDTO, UriComponentsBuilder uriComponentsBuilder) {
        Beneficiary beneficiary = beneficiaryService.getOrThrowException(withdrawalFormDTO.beneficiaryId());
        AppUser attendantUser = appUserService.getOrThrowException(withdrawalFormDTO.attendantUserId());

        Withdrawal withdrawal = withdrawalService.generateWithdrawal(withdrawalFormDTO, beneficiary, attendantUser);
        withdrawalService.save(withdrawal, withdrawalFormDTO);

        URI uri = HttpUtils.createURI(uriComponentsBuilder, "withdrawal", withdrawal.getWithdrawalId());

        return ResponseEntity.created(uri).body(withdrawalService.generateWithdrawalDTO(withdrawal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid WithdrawalFormDTO withdrawalFormDTO) {
        Beneficiary beneficiary = beneficiaryService.getOrThrowException(withdrawalFormDTO.beneficiaryId());
        AppUser attendantUser = appUserService.getOrThrowException(withdrawalFormDTO.attendantUserId());

        Withdrawal withdrawal = withdrawalService.getOrNull(id);
        if(withdrawal == null) return ResponseEntity.notFound().build();

        withdrawalService.updateWithdrawal(withdrawal, withdrawalFormDTO, beneficiary, attendantUser);

        withdrawalService.save(withdrawal);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Withdrawal withdrawal = withdrawalService.getOrNull(id);
        if(withdrawal == null) return ResponseEntity.notFound().build();

        withdrawalService.delete(withdrawal);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/beneficiary/{beneficiaryId}/limit-info")
    public ResponseEntity<LimitInfoDTO> getLimitInfo(@PathVariable Long beneficiaryId) {
        int itemsWithdrawn = withdrawalService.getItemsWithdrawnThisMonth(beneficiaryId);
        int monthlyLimit = withdrawalService.getMonthlyLimit(beneficiaryId);
        int remaining = Math.max(0, monthlyLimit - itemsWithdrawn);

        LimitInfoDTO limitInfo = new LimitInfoDTO(itemsWithdrawn, monthlyLimit, remaining);
        return ResponseEntity.ok(limitInfo);
    }

    public record LimitInfoDTO(
            int itemsWithdrawnThisMonth,
            int monthlyLimit,
            int remainingItems
    ) {}
}
