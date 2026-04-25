package com.javalovers.core.withdrawal.mapper;

import com.javalovers.core.appuser.mapper.AppUserDTOMapper;
import com.javalovers.core.beneficiary.mapper.BeneficiaryDTOMapper;
import com.javalovers.core.itemwithdrawn.domain.entity.ItemWithdrawn;
import com.javalovers.core.itemwithdrawn.mapper.ItemWithdrawnDTOMapper;
import com.javalovers.core.itemwithdrawn.repository.ItemWithdrawnRepository;
import com.javalovers.core.withdrawal.domain.dto.response.WithdrawalDTO;
import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class WithdrawalDTOMapper {

    private final BeneficiaryDTOMapper beneficiaryDTOMapper;
    private final AppUserDTOMapper appUserDTOMapper;
    private final ItemWithdrawnDTOMapper itemWithdrawnDTOMapper;
    private final ItemWithdrawnRepository itemWithdrawnRepository;

    public WithdrawalDTO convert(Withdrawal withdrawal) {
        if (withdrawal == null) return null;
        
        // Buscar itens retirados
        List<ItemWithdrawn> itemsWithdrawn = withdrawal.getWithdrawalId() != null 
            ? itemWithdrawnRepository.findByWithdrawal_WithdrawalId(withdrawal.getWithdrawalId())
            : List.of();
        
        return new WithdrawalDTO(
                withdrawal.getWithdrawalId(),
                withdrawal.getWithdrawalDate(),
                beneficiaryDTOMapper.convert(withdrawal.getBeneficiary()),
                appUserDTOMapper.convert(withdrawal.getAttendantUser()),
                itemsWithdrawn.stream()
                    .map(itemWithdrawnDTOMapper::convert)
                    .collect(Collectors.toList())
        );
    }

}
