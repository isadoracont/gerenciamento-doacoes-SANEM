package com.javalovers.core.withdrawallimit.controller;

import com.javalovers.core.withdrawallimit.domain.dto.request.WithdrawalLimitConfigFormDTO;
import com.javalovers.core.withdrawallimit.domain.dto.response.WithdrawalLimitConfigDTO;
import com.javalovers.core.withdrawallimit.domain.entity.WithdrawalLimitConfig;
import com.javalovers.core.withdrawallimit.service.WithdrawalLimitConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/withdrawal-limit-config")
public class WithdrawalLimitConfigController {

    private final WithdrawalLimitConfigService service;

    @GetMapping("/active")
    public ResponseEntity<WithdrawalLimitConfigDTO> getActiveConfig() {
        WithdrawalLimitConfigDTO configDTO = service.getActiveConfigDTO();
        return ResponseEntity.ok(configDTO);
    }

    @GetMapping
    public ResponseEntity<List<WithdrawalLimitConfigDTO>> list() {
        List<WithdrawalLimitConfig> configs = service.list();
        List<WithdrawalLimitConfigDTO> configDTOs = configs.stream()
                .map(service::generateConfigDTO)
                .toList();
        return ResponseEntity.ok(configDTOs);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WithdrawalLimitConfigDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid WithdrawalLimitConfigFormDTO formDTO) {
        WithdrawalLimitConfig config = service.updateConfig(id, formDTO);
        return ResponseEntity.ok(service.generateConfigDTO(config));
    }
}

