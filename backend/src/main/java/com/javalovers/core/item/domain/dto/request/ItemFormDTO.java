package com.javalovers.core.item.domain.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ItemFormDTO(
        @JsonProperty("description")
        String description,
        
        @JsonProperty("stockQuantity")
        Long stockQuantity,
        
        @JsonProperty("tagCode")
        String tagCode
) {
}
