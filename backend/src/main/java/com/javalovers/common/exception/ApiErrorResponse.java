package com.javalovers.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private final String error;
    private final String message;
    private final Integer status;
    private final OffsetDateTime timestamp;
    private final Map<String, String> errors;

    public ApiErrorResponse(String error, String message, int status, Map<String, String> errors) {
        this.error = error;
        this.message = message;
        this.status = status;
        this.timestamp = OffsetDateTime.now();
        this.errors = errors;
    }

    public ApiErrorResponse(String error, String message, int status) {
        this(error, message, status, null);
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public Integer getStatus() {
        return status;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
