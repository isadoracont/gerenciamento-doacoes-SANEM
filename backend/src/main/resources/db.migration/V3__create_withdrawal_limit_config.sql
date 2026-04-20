-- MySQL compatible version
CREATE TABLE IF NOT EXISTS withdrawal_limit_config (
    config_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    monthly_item_limit INT NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_monthly_limit_positive CHECK (monthly_item_limit > 0)
);

-- Inserir configuração padrão (apenas se não existir)
INSERT INTO withdrawal_limit_config (monthly_item_limit, is_active)
SELECT 10, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM withdrawal_limit_config WHERE is_active = TRUE
);

