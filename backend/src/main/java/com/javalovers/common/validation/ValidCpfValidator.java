package com.javalovers.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidCpfValidator implements ConstraintValidator<ValidCpf, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }

        String cleaned = value.replaceAll("\\D", "");
        if (cleaned.length() != 11) {
            return false;
        }

        if (cleaned.matches("^(\\d)\\1{10}$")) {
            return false;
        }

        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(cleaned.charAt(i)) * (10 - i);
        }

        int remainder = sum % 11;
        int firstVerifier = remainder < 2 ? 0 : 11 - remainder;
        if (firstVerifier != Character.getNumericValue(cleaned.charAt(9))) {
            return false;
        }

        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(cleaned.charAt(i)) * (11 - i);
        }

        remainder = sum % 11;
        int secondVerifier = remainder < 2 ? 0 : 11 - remainder;
        return secondVerifier == Character.getNumericValue(cleaned.charAt(10));
    }
}
