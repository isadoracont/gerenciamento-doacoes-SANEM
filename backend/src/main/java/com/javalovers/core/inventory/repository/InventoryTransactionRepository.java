package com.javalovers.core.inventory.repository;

import com.javalovers.core.inventory.domain.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    boolean existsByItemItemId(Long itemId);
}
