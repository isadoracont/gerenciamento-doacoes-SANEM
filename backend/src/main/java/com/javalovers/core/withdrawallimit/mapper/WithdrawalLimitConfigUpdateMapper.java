package com.javalovers.core.withdrawallimit.mapper;

import com.javalovers.core.withdrawallimit.domain.dto.request.WithdrawalLimitConfigFormDTO;
import com.javalovers.core.withdrawallimit.domain.entity.WithdrawalLimitConfig;
import org.springframework.stereotype.Service;

@Service
public class WithdrawalLimitConfigUpdateMapper {

    public void update(WithdrawalLimitConfig config, WithdrawalLimitConfigFormDTO formDTO) {
        config.setMonthlyItemLimit(formDTO.monthlyItemLimit());
        config.setIsActive(formDTO.isActive());
    }
}

