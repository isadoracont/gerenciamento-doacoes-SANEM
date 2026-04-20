package com.javalovers.core.withdrawal.mapper;

import com.javalovers.core.appuser.domain.entity.AppUser;
import com.javalovers.core.beneficiary.domain.entity.Beneficiary;
import com.javalovers.core.withdrawal.domain.dto.request.WithdrawalFormDTO;
import com.javalovers.core.withdrawal.domain.entity.Withdrawal;
import org.springframework.stereotype.Service;

@Service
public class WithdrawalUpdateMapper {

    public void update(Withdrawal withdrawal, WithdrawalFormDTO withdrawalFormDTO, Beneficiary beneficiary, AppUser attendantUser){
        withdrawal.setWithdrawalDate(withdrawalFormDTO.withdrawalDate());
        withdrawal.setBeneficiary(beneficiary);
        withdrawal.setAttendantUser(attendantUser);
    }

}
