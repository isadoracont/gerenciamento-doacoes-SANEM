package com.javalovers.core.withdrawal.domain.entity;

import com.javalovers.common.entity.SoftDeletable;
import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "withdrawal")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Withdrawal implements SoftDeletable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "withdrawal_id")
    private Long withdrawalId;

    @NotNull
    @Column(name = "withdrawal_date")
    private Date withdrawalDate;

    @NotNull
    @JoinColumn(name = "beneficiary_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Beneficiary beneficiary;

    @NotNull
    @JoinColumn(name = "attendant_user_id")
    @OneToOne(fetch = FetchType.LAZY)
    private AppUser attendantUser;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
