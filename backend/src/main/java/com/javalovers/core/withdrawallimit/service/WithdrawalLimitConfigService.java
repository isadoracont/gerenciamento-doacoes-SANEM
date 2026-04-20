package com.javalovers.core.withdrawallimit.service;

import com.javalovers.core.withdrawallimit.domain.dto.request.WithdrawalLimitConfigFormDTO;
import com.javalovers.core.withdrawallimit.domain.dto.response.WithdrawalLimitConfigDTO;
import com.javalovers.core.withdrawallimit.domain.entity.WithdrawalLimitConfig;
import com.javalovers.core.withdrawallimit.mapper.WithdrawalLimitConfigDTOMapper;
import com.javalovers.core.withdrawallimit.mapper.WithdrawalLimitConfigUpdateMapper;
import com.javalovers.core.withdrawallimit.repository.WithdrawalLimitConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WithdrawalLimitConfigService {

    private final WithdrawalLimitConfigRepository repository;
    private final WithdrawalLimitConfigDTOMapper dtoMapper;
    private final WithdrawalLimitConfigUpdateMapper updateMapper;

    public WithdrawalLimitConfig getActiveConfig() {
        return repository.findByIsActiveTrue()
                .orElseGet(() -> {
                    // Se não houver configuração ativa, criar uma padrão
                    WithdrawalLimitConfig defaultConfig = new WithdrawalLimitConfig();
                    defaultConfig.setMonthlyItemLimit(10);
                    defaultConfig.setIsActive(true);
                    return repository.save(defaultConfig);
                });
    }

    public WithdrawalLimitConfigDTO getActiveConfigDTO() {
        return dtoMapper.convert(getActiveConfig());
    }

    public List<WithdrawalLimitConfig> list() {
        return repository.findAll();
    }

    public WithdrawalLimitConfig getOrNull(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public WithdrawalLimitConfig updateConfig(Long id, WithdrawalLimitConfigFormDTO formDTO) {
        WithdrawalLimitConfig config = getOrNull(id);
        if (config == null) {
            throw new IllegalArgumentException("Configuração não encontrada");
        }

        // Se está ativando esta configuração, desativar as outras
        if (formDTO.isActive() && !config.getIsActive()) {
            repository.findAll().forEach(c -> {
                if (!c.getConfigId().equals(id)) {
                    c.setIsActive(false);
                    repository.save(c);
                }
            });
        }

        updateMapper.update(config, formDTO);
        return repository.save(config);
    }

    public WithdrawalLimitConfigDTO generateConfigDTO(WithdrawalLimitConfig config) {
        return dtoMapper.convert(config);
    }
}

