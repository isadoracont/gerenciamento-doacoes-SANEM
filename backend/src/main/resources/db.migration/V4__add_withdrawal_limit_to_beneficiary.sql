-- Adicionar campos de limite de retiradas na tabela beneficiary
ALTER TABLE beneficiary
ADD COLUMN withdrawal_limit INT DEFAULT NULL,
ADD COLUMN current_withdrawals_this_month INT DEFAULT 0;





