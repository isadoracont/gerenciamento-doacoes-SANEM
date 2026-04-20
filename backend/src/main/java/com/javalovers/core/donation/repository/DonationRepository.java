package com.javalovers.core.donation.repository;

import com.javalovers.core.donation.domain.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long>{
}
