-- =====================================================================
-- ESQUEMA: Sistema de Doações / Beneficiários
-- Adaptado para MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sanem
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE sanem;

-- =====================================================================
-- TABELAS BÁSICAS
-- =====================================================================

CREATE TABLE profile (
     profile_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     description VARCHAR(255),

     UNIQUE KEY uq_profile_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_user (
     user_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(120) NOT NULL,
     login VARCHAR(60) NOT NULL,
     email VARCHAR(160) NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
     profile_id INT NOT NULL,

     CONSTRAINT fk_app_user_profile FOREIGN KEY (profile_id) REFERENCES profile(profile_id)
          ON UPDATE RESTRICT ON DELETE RESTRICT,
     UNIQUE KEY uq_user_login (login),
     UNIQUE KEY uq_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE beneficiary (
     beneficiary_id INT AUTO_INCREMENT PRIMARY KEY,
     full_name VARCHAR(160) NOT NULL,
     cpf VARCHAR(14) NOT NULL,
     address VARCHAR(255),
     phone VARCHAR(120),
     socioeconomic_data TEXT,
     beneficiary_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
     approver_user_id INT,
     withdrawal_limit INT DEFAULT NULL,
     current_withdrawals_this_month INT DEFAULT 0,

     CONSTRAINT fk_beneficiary_approver FOREIGN KEY (approver_user_id) REFERENCES app_user(user_id)
         ON UPDATE RESTRICT ON DELETE SET NULL,
     UNIQUE KEY uq_beneficiary_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE card (
     card_id INT AUTO_INCREMENT PRIMARY KEY,
     unique_number VARCHAR(64) NOT NULL,
     beneficiary_id INT NOT NULL,
     issue_date TIMESTAMP(6) NULL,

     CONSTRAINT fk_card_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiary(beneficiary_id)
          ON UPDATE RESTRICT ON DELETE RESTRICT,
     UNIQUE KEY uq_card_number (unique_number),
     UNIQUE KEY uq_card_beneficiary (beneficiary_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE category (
     category_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,

     UNIQUE KEY uq_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    tag_code VARCHAR(64),

    UNIQUE KEY uq_item_code (tag_code),
    CHECK (stock_quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE donor (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    cpf_cnpj VARCHAR(20),
    contact VARCHAR(160),

    UNIQUE KEY uq_donor_cpfcnpj (cpf_cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE donation (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    receiver_user_id INT NOT NULL,
    donor_id INT,
    CONSTRAINT fk_donation_receiver_user FOREIGN KEY (receiver_user_id) REFERENCES app_user(user_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES donor(donor_id)
        ON UPDATE RESTRICT ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE withdrawal (
    withdrawal_id INT AUTO_INCREMENT PRIMARY KEY,
    withdrawal_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    beneficiary_id INT NOT NULL,
    attendant_user_id INT NOT NULL,

    CONSTRAINT fk_withdrawal_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiary(beneficiary_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_withdrawal_attendant_user FOREIGN KEY (attendant_user_id) REFERENCES app_user(user_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABELAS ASSOCIATIVAS (N:M)
-- =====================================================================

CREATE TABLE item_donated (
    item_donated_id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,

    CONSTRAINT fk_item_donated_donation FOREIGN KEY (donation_id) REFERENCES donation(donation_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_item_donated_item FOREIGN KEY (item_id) REFERENCES item(item_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    UNIQUE KEY uk_item_donated (donation_id, item_id),
    CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_withdrawn (
    item_withdrawn_id INT AUTO_INCREMENT PRIMARY KEY,
    withdrawal_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,

    CONSTRAINT fk_item_withdrawn_withdrawal FOREIGN KEY (withdrawal_id) REFERENCES withdrawal(withdrawal_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_item_withdrawn_item FOREIGN KEY (item_id) REFERENCES item(item_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    UNIQUE KEY uk_item_withdrawn (withdrawal_id, item_id),
    CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
