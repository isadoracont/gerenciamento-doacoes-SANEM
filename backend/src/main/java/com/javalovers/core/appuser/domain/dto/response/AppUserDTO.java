package com.javalovers.core.appuser.domain.dto.response;

import com.javalovers.core.profile.domain.dto.response.ProfileDTO;
import com.javalovers.core.status.Status;

public record AppUserDTO(
                Long userId,
                String name,
                String login,
                String email,
                Status status,
                ProfileDTO profile) {
}
