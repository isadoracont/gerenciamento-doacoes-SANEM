package com.javalovers.core.withdrawalreset.domain.entity;

import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "withdrawal_limit_reset")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalLimitReset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "withdrawal_limit_reset_id")
    private Long withdrawalLimitResetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Beneficiary beneficiary;

    @Column(name = "reset_date", nullable = false)
    private Date resetDate;
}