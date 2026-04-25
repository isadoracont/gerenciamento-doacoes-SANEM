package com.javalovers.common.exception;

import org.hibernate.LazyInitializationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<Map<String, Object>> handleLazyInitializationException(LazyInitializationException ex) {
        logger.error("LazyInitializationException: ", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Erro de inicialização lazy");
        response.put("message", "Erro ao carregar relacionamentos. Verifique se os relacionamentos estão sendo carregados corretamente.");
        response.put("details", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFoundException(EntityNotFoundException ex) {
        logger.error("EntityNotFoundException: ", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Entidade não encontrada");
        response.put("message", String.format("A entidade %s não foi encontrada", ex.getEntity()));
        if (ex.getId() != null) {
            response.put("id", ex.getId());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        logger.error("Erro não tratado: ", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Erro interno do servidor");
        response.put("message", ex.getMessage());
        response.put("type", ex.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

