package com.javalovers.core.withdrawal.specification;

import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Date;

public class WithdrawalSpecification {

    public static Specification<Withdrawal> isNotDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Withdrawal> betweenDates(Date startDate, Date endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("withdrawalDate"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("withdrawalDate"), startDate);
            } else if (endDate != null) {
                return cb.lessThanOrEqualTo(root.get("withdrawalDate"), endDate);
            }
            return null;
        };
    }

    public static Specification<Withdrawal> hasBeneficiaryName(String beneficiaryName) {
        return (root, query, cb) -> {
            if (beneficiaryName == null || beneficiaryName.trim().isEmpty()) return null;
            var beneficiary = root.join("beneficiary", JoinType.INNER);
            return cb.like(cb.lower(beneficiary.get("fullName")), "%" + beneficiaryName.toLowerCase() + "%");
        };
    }

    public static Specification<Withdrawal> hasAttendantName(String attendantName) {
        return (root, query, cb) -> {
            if (attendantName == null || attendantName.trim().isEmpty()) return null;
            var user = root.join("attendantUser", JoinType.INNER);
            return cb.like(cb.lower(user.get("name")), "%" + attendantName.toLowerCase() + "%");
        };
    }

    public static Specification<Withdrawal> hasItemName(String itemName) {
        return (root, query, cb) -> {
            if (itemName == null || itemName.trim().isEmpty()) return null;
            var itemWithdrawn = root.join("items", JoinType.INNER);
            var item = itemWithdrawn.join("item", JoinType.INNER);
            return cb.like(cb.lower(item.get("description")), "%" + itemName.toLowerCase() + "%");
        };
    }

    public static Specification<Withdrawal> hasBeneficiaryId(Long beneficiaryId) {
        return (root, query, cb) -> {
            if (beneficiaryId == null) return null;
            var beneficiary = root.join("beneficiary", JoinType.INNER);
            return cb.equal(beneficiary.get("beneficiaryId"), beneficiaryId);
        };
    }

    public static Specification<Withdrawal> hasAttendantUserId(Long attendantUserId) {
        return (root, query, cb) -> {
            if (attendantUserId == null) return null;
            var user = root.join("attendantUser", JoinType.INNER);
            return cb.equal(user.get("userId"), attendantUserId); 
        };
    }
}
