package com.javalovers.core.donor.domain.entity;

import com.javalovers.common.entity.SoftDeletable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "donor")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Donor implements SoftDeletable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "donor_id")
    private Long donorId;

    @NotNull
    @Column(name = "name")
    private String name;

    @Column(name = "cpf_cnpj", unique = true)
    private String cpfCnpj;

    @Column(name = "contact")
    private String contact;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
