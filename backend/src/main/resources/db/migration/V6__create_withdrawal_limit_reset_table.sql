CREATE TABLE withdrawal_limit_reset (
    withdrawal_limit_reset_id INT AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id INT NOT NULL,
    reset_date DATETIME NOT NULL,

    CONSTRAINT fk_withdrawal_limit_reset_beneficiary
        FOREIGN KEY (beneficiary_id)
        REFERENCES beneficiary(beneficiary_id)
);

CREATE INDEX idx_withdrawal_limit_reset_beneficiary_date
ON withdrawal_limit_reset (beneficiary_id, reset_date);