package com.javalovers.core.status;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum Status {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE");

    private final String databaseValue;

    Status(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static Status fromDatabaseValue(String databaseValue) {
        for (Status status : Status.values()) {
            if (status.databaseValue.equals(databaseValue)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown database value: " + databaseValue);
    }

    @Converter
    public static class StatusConverter implements AttributeConverter<Status, String> {
        @Override
        public String convertToDatabaseColumn(Status status) {
            return status != null ? status.getDatabaseValue() : null;
        }

        @Override
        public Status convertToEntityAttribute(String databaseValue) {
            return databaseValue != null ? Status.fromDatabaseValue(databaseValue) : null;
        }
    }
}
