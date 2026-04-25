package com.javalovers.core.donor.repository;

import com.javalovers.core.donor.domain.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long>, JpaSpecificationExecutor<Donor> {
    
    @org.springframework.data.jpa.repository.Query("SELECT d FROM Donor d WHERE d.donorId = :id AND d.deletedAt IS NULL")
    java.util.Optional<Donor> findById(@org.springframework.data.repository.query.Param("id") Long id);
}
