package com.javalovers.core.card.repository;

import com.javalovers.core.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long>, JpaSpecificationExecutor<Card> {
    Optional<Card> findByBeneficiaryId(Long beneficiaryId);
    Optional<Card> findByUniqueNumber(String uniqueNumber);
}
