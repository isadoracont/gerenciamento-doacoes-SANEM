package com.javalovers.core.withdrawallimit.repository;

import com.javalovers.core.withdrawallimit.domain.entity.WithdrawalLimitConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WithdrawalLimitConfigRepository extends JpaRepository<WithdrawalLimitConfig, Long> {
    Optional<WithdrawalLimitConfig> findByIsActiveTrue();
}

