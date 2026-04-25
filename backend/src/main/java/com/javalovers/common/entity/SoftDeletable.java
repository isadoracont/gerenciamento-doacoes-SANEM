package com.javalovers.common.entity;

import java.time.LocalDateTime;

/**
 * Interface para entidades que suportam soft delete.
 * Entidades que implementam esta interface terão o campo deletedAt
 * para marcar registros como deletados sem removê-los fisicamente.
 */
public interface SoftDeletable {
    LocalDateTime getDeletedAt();
    void setDeletedAt(LocalDateTime deletedAt);
    
    default boolean isDeleted() {
        return getDeletedAt() != null;
    }
    
    default void softDelete() {
        setDeletedAt(LocalDateTime.now());
    }
}

