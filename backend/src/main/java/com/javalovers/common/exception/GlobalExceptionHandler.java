package com.javalovers.common.exception;

import jakarta.validation.ConstraintViolationException;
import org.hibernate.LazyInitializationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<ApiErrorResponse> handleLazyInitializationException(LazyInitializationException ex) {
        logger.error("LazyInitializationException: ", ex);
        ApiErrorResponse response = new ApiErrorResponse(
            "Erro interno do servidor",
            "Não foi possível carregar os dados solicitados. Tente novamente ou contate o suporte.",
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleEntityNotFoundException(EntityNotFoundException ex) {
        logger.error("EntityNotFoundException: ", ex);
        ApiErrorResponse response = new ApiErrorResponse(
            "Recurso não encontrado",
            String.format("O recurso %s não foi encontrado.", ex.getEntity()),
            HttpStatus.NOT_FOUND.value()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolationException(ConstraintViolationException ex) {
        logger.error("ConstraintViolationException: ", ex);
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String field = violation.getPropertyPath().toString();
            errors.put(field, violation.getMessage());
        });

        ApiErrorResponse response = new ApiErrorResponse(
            "Erro de validação",
            "Alguns valores fornecidos são inválidos. Verifique e tente novamente.",
            HttpStatus.BAD_REQUEST.value(),
            errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        logger.error("HttpMessageNotReadableException: ", ex);
        ApiErrorResponse response = new ApiErrorResponse(
            "Requisição inválida",
            "O corpo da requisição está em um formato inválido. Verifique o JSON e tente novamente.",
            HttpStatus.BAD_REQUEST.value()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        logger.error("MethodArgumentTypeMismatchException: ", ex);
        ApiErrorResponse response = new ApiErrorResponse(
            "Valor inválido",
            String.format("O valor fornecido para '%s' é inválido.", ex.getName()),
            HttpStatus.BAD_REQUEST.value()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingServletRequestParameterException(MissingServletRequestParameterException ex) {
        logger.error("MissingServletRequestParameterException: ", ex);
        ApiErrorResponse response = new ApiErrorResponse(
            "Parâmetro obrigatório ausente",
            String.format("O parâmetro '%s' é obrigatório.", ex.getParameterName()),
            HttpStatus.BAD_REQUEST.value()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex) {
        logger.error("Erro não tratado: ", ex);
        ApiErrorResponse response = new ApiErrorResponse(
            "Erro interno do servidor",
            "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

