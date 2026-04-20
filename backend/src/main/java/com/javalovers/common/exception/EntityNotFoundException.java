package com.javalovers.common.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EntityNotFoundException extends RuntimeException{
    private final String entity;
    private final Long id;

    public EntityNotFoundException(String entity, Long id) {
        super();
        this.entity = entity;
        this.id = id;
    }

    public EntityNotFoundException(String entity) {
        super();
        this.entity = entity;
        this.id = null;
    }
}
