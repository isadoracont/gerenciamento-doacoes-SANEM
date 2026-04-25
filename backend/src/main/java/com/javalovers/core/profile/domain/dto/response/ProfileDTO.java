package com.javalovers.core.profile.domain.dto.response;

public record ProfileDTO(
        Long profileId,
        String description,
        String name
) {
}
