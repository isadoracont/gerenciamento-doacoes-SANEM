package com.javalovers.core.withdrawal.repository;

import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long>, JpaSpecificationExecutor<Withdrawal> {
    
    @Query("SELECT w FROM Withdrawal w WHERE w.withdrawalId = :id AND w.deletedAt IS NULL")
    java.util.Optional<Withdrawal> findById(@org.springframework.data.repository.query.Param("id") Long id);
}
