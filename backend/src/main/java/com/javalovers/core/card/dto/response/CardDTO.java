package com.javalovers.core.card.dto.response;

import java.util.Date;

public record CardDTO(
        Long cardId,
        String uniqueNumber,
        Long beneficiaryId,
        Date issueDate
) {
}
