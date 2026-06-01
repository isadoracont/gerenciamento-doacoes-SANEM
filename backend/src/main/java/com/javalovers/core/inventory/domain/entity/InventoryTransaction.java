package com.javalovers.core.inventory.domain.entity;

import com.javalovers.core.inventory.domain.enums.TransactionType;
import com.javalovers.core.item.domain.entity.Item;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transaction")
@Getter
@Setter
@NoArgsConstructor
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @NotNull
    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public InventoryTransaction(Item item, Long quantity, TransactionType transactionType, Long referenceId) {
        this.item = item;
        this.quantity = quantity;
        this.transactionType = transactionType;
        this.referenceId = referenceId;
    }
}
