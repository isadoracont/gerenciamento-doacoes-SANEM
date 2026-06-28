package com.javalovers.core.donation.specification;

import com.javalovers.core.donation.domain.entity.Donation;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Date;

public class DonationSpecification {

    public static Specification<Donation> isNotDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Donation> betweenDates(Date startDate, Date endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("donationDate"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("donationDate"), startDate);
            } else if (endDate != null) {
                return cb.lessThanOrEqualTo(root.get("donationDate"), endDate);
            }
            return null;
        };
    }

    public static Specification<Donation> hasDonorName(String donorName) {
        return (root, query, cb) -> {
            if (donorName == null || donorName.trim().isEmpty()) return null;
            // Faz o Join com a tabela Donor
            var donor = root.join("donor", JoinType.INNER);
            return cb.like(cb.lower(donor.get("name")), "%" + donorName.toLowerCase() + "%");
        };
    }

    public static Specification<Donation> hasAttendantName(String attendantName) {
        return (root, query, cb) -> {
            if (attendantName == null || attendantName.trim().isEmpty()) return null;
            // Faz o Join com a tabela AppUser (receiverUser)
            var user = root.join("receiverUser", JoinType.INNER);
            return cb.like(cb.lower(user.get("name")), "%" + attendantName.toLowerCase() + "%");
        };
    }

    public static Specification<Donation> hasItemName(String itemName) {
        return (root, query, cb) -> {
            if (itemName == null || itemName.trim().isEmpty()) return null;
            // Faz o Join de Donation para ItemDonated, e depois de ItemDonated para Item
            var itemDonated = root.join("items", JoinType.INNER);
            var item = itemDonated.join("item", JoinType.INNER);
            return cb.like(cb.lower(item.get("description")), "%" + itemName.toLowerCase() + "%");
        };
    }
}