package com.javalovers.core.itemwithdrawn.domain.entity;

import com.javalovers.common.entity.SoftDeletable;
import com.javalovers.core.item.domain.entity.Item;
import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_withdrawn")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ItemWithdrawn implements SoftDeletable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_withdrawn_id")
    private Long itemWithdrawnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "withdrawal_id", nullable = false)
    private Withdrawal withdrawal;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
