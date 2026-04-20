package com.javalovers.core.itemdonated.repository;

import com.javalovers.core.itemdonated.domain.entity.ItemDonated;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemDonatedRepository extends JpaRepository<ItemDonated, Long> {
}
