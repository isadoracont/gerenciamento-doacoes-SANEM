package com.javalovers.core.itemdonated.domain.entity;

import com.javalovers.common.entity.SoftDeletable;
import com.javalovers.core.donation.domain.entity.Donation;
import com.javalovers.core.item.domain.entity.Item;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_donated")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemDonated implements SoftDeletable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_donated_id")
    private Long itemDonatedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}