package com.javalovers.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidCpfCnpjValidator implements ConstraintValidator<ValidCpfCnpj, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }

        String cleaned = value.replaceAll("\\D", "");
        if (cleaned.length() == 11) {
            return isValidCpf(cleaned);
        }
        if (cleaned.length() == 14) {
            return isValidCnpj(cleaned);
        }
        return false;
    }

    private boolean isValidCpf(String value) {
        if (value.matches("^(\\d)\\1{10}$")) {
            return false;
        }

        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(value.charAt(i)) * (10 - i);
        }

        int remainder = sum % 11;
        int firstVerifier = remainder < 2 ? 0 : 11 - remainder;
        if (firstVerifier != Character.getNumericValue(value.charAt(9))) {
            return false;
        }

        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(value.charAt(i)) * (11 - i);
        }

        remainder = sum % 11;
        int secondVerifier = remainder < 2 ? 0 : 11 - remainder;
        return secondVerifier == Character.getNumericValue(value.charAt(10));
    }

    private boolean isValidCnpj(String value) {
        if (value.matches("^(\\d)\\1{13}$")) {
            return false;
        }

        int[] weights1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] weights2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int sum = 0;
        for (int i = 0; i < 12; i++) {
            sum += Character.getNumericValue(value.charAt(i)) * weights1[i];
        }

        int remainder = sum % 11;
        int firstVerifier = remainder < 2 ? 0 : 11 - remainder;
        if (firstVerifier != Character.getNumericValue(value.charAt(12))) {
            return false;
        }

        sum = 0;
        for (int i = 0; i < 13; i++) {
            sum += Character.getNumericValue(value.charAt(i)) * weights2[i];
        }

        remainder = sum % 11;
        int secondVerifier = remainder < 2 ? 0 : 11 - remainder;
        return secondVerifier == Character.getNumericValue(value.charAt(13));
    }
}
