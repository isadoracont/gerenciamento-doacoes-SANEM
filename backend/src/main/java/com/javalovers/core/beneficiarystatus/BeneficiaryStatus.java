package com.javalovers.core.beneficiarystatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum BeneficiaryStatus {
    PENDING("PENDING"),
    APPROVED("APPROVED"),
    REJECTED("REJECTED");

    private final String databaseValue;

    BeneficiaryStatus(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static BeneficiaryStatus fromDatabaseValue(String databaseValue) {
        for (BeneficiaryStatus status : BeneficiaryStatus.values()) {
            if (status.databaseValue.equals(databaseValue)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown database value: " + databaseValue);
    }

    @Converter
    public static class BeneficiaryStatusConverter implements AttributeConverter<BeneficiaryStatus, String> {
        @Override
        public String convertToDatabaseColumn(BeneficiaryStatus status) {
            return status != null ? status.getDatabaseValue() : null;
        }

        @Override
        public BeneficiaryStatus convertToEntityAttribute(String databaseValue) {
            return databaseValue != null ? BeneficiaryStatus.fromDatabaseValue(databaseValue) : null;
        }
    }
}
