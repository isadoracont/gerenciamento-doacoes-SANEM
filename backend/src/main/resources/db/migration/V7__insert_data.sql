USE sanem;

-- =====================================================================
-- 1. DESATIVAR CHECAGEM DE CHAVES ESTRANGEIRAS PARA LIMPEZA
-- =====================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 2. LIMPEZA TOTAL (TRUNCATE RESETA OS IDs PARA 1)
-- =====================================================================
TRUNCATE TABLE inventory_transaction;
TRUNCATE TABLE withdrawal_limit_reset;
TRUNCATE TABLE item_withdrawn;
TRUNCATE TABLE item_donated;
TRUNCATE TABLE withdrawal;
TRUNCATE TABLE donation;
TRUNCATE TABLE donor;
TRUNCATE TABLE item;
TRUNCATE TABLE beneficiary;
TRUNCATE TABLE app_user;

-- =====================================================================
-- 3. REATIVAR CHECAGEM DE CHAVES ESTRANGEIRAS
-- =====================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 4. INSERÇÃO DE USUÁRIOS
-- IMPORTANTE: O hash atual equivale a '{name}@2026', ex.: Isadora@2026
-- =====================================================================
INSERT INTO app_user (name, login, email, password_hash, status, profile_id) VALUES
('Isadora', 'isadora', 'isadora@gmail.com', '$2a$12$zM3oy9SL3q3hUZZomXMASOm1lRn.sSC85NxNnYDi.U0j2c0x3444u', 'ACTIVE', 1),
('Isis', 'isis', 'isis@gmail.com', '$2a$12$zA0uM7s0gZtskYelrtnmIeW9L3OMfx6Ixg09FpQCp1ZmhtdSideJa', 'ACTIVE', 2),
('Victor', 'victor', 'victor@gmail.com', '$2a$12$15TzGy3o9QVZX8xAXR2uTuaatS3XrAyEqSPu.Lo/G6kX9WtjEDY46', 'ACTIVE', 3),
('Layssa', 'layssa', 'layssa@gmail.com', '$2a$12$WFw8qRw4hqc.kQZiNNUUi..FWxi9cxsSA2e7GLHx3g7ott1Ds37li', 'ACTIVE', 1);

-- =====================================================================
-- 5. INSERÇÃO DE DOADORES
-- =====================================================================
INSERT INTO donor (name, cpf_cnpj, contact, email) VALUES
('Supermercado Bom Preço', '12345678000199', '1140028922', 'contato@bompreco.com.br'),
('Atacadão da Família', '98765432000111', '1133334444', 'doacoes@atacadaofamilia.com'),
('Maria Rita Costa', '11122233344', '11988887777', 'mariarita.costa@gmail.com'),
('João Pedro Almeida', '55566677788', '11955554444', 'jpalmeida_doador@hotmail.com'),
('Igreja Esperança', '45678912000133', '1130302020', 'comunidade@igrejaesperanca.org'),
('Farmácia Saúde', '77788899000122', '1132221111', 'gerencia@farmaciasaude.com'),
('Carlos Eduardo Souza', '99988877766', '11977778888', 'cadu_souza@gmail.com'),
('Confecções Silva', '11222333000144', '1144445555', 'contato@confeccoessilva.com.br'),
('Ana Paula Mendes', '22233344455', '11966663333', 'aninha.mendes@yahoo.com'),
('Clube Lions Local', '33444555000166', '1139998888', 'diretoria@lionslocal.org');

-- =====================================================================
-- 6. INSERÇÃO DE BENEFICIÁRIOS
-- Distribuindo aprovações entre Isadora (1), Victor (3) e Layssa (4)
-- =====================================================================
INSERT INTO beneficiary (full_name, cpf, phone, socioeconomic_data, beneficiary_status, approver_user_id, withdrawal_limit) VALUES
('Marta Ferreira', '10120230344', '11911112222', 'Mãe solteira, desempregada', 'APPROVED', 3, 10),
('José Roberto Dias', '20230340455', '11922223333', 'Idoso, recebe BPC', 'APPROVED', 1, 10),
('Aline Rodrigues', '30340450566', '11933334444', 'Renda menor que 1 salário', 'APPROVED', 4, 10),
('Fernando Castro', '40450560677', '11944445555', 'Acamado, esposa não trabalha', 'APPROVED', 3, 10),
('Luciana Martins', '50560670788', '11955556666', 'Pagando aluguel, sem emprego', 'APPROVED', 1, 10),
('Ricardo Gomes', '60670780899', '11966667777', 'Trabalhador informal', 'APPROVED', 4, 10),
('Teresa Nunes', '70780890900', '11977778888', 'Cuida de netos, sem renda', 'APPROVED', 3, 10),
('Gabriel Peixoto', '80890910111', '11988889999', 'Estudante em ocupação', 'PENDING', NULL, 10),
('Camila Vieira', '90910120222', '11999990000', 'Ajuda emergencial', 'PENDING', NULL, 10),
('Roberto Antunes', '01020230333', '11900001111', 'Renda superior ao limite', 'REJECTED', 3, 10);

-- =====================================================================
-- 7. INSERÇÃO DE ITENS
-- =====================================================================
INSERT INTO item (description, stock_quantity, tag_code) VALUES
('Arroz Branco 5kg', 120, 'ETQ-ARR-001'),
('Feijão Carioca 1kg', 85, 'ETQ-FEI-001'),
('Macarrão Espaguete 500g', 150, 'ETQ-MAC-001'),
('Óleo de Soja 900ml', 90, 'ETQ-OLE-001'),
('Leite Integral 1L', 200, 'ETQ-LEI-001'),
('Sabonete em Barra 90g', 300, 'ETQ-SAB-001'),
('Creme Dental 90g', 250, 'ETQ-CRE-001'),
('Fralda Descartável Tam M', 45, 'ETQ-FRA-001');

-- =====================================================================
-- 8. DOAÇÕES (Espalhadas por Junho de 2026 - Mês 6)
-- Distribuído entre usuários 1, 2, 3 e 4
-- =====================================================================
INSERT INTO donation (donation_id, donation_date, receiver_user_id, donor_id) VALUES
(1, '2026-06-02 09:15:00', 1, 1),
(2, '2026-06-05 14:30:00', 2, 2),
(3, '2026-06-08 10:00:00', 3, 3),
(4, '2026-06-12 11:45:00', 4, 4),
(5, '2026-06-15 16:20:00', 1, 5),
(6, '2026-06-18 08:50:00', 2, 6),
(7, '2026-06-20 13:10:00', 3, 7),
(8, '2026-06-25 15:00:00', 4, 8),
(9, '2026-06-27 09:30:00', 2, 9),
(10, '2026-06-28 14:00:00', 1, 10);

-- ITENS DOADOS (Entradas)
INSERT INTO item_donated (donation_id, item_id, quantity) VALUES
(1, 1, 50), (1, 2, 50), (1, 3, 50),
(2, 4, 30), (2, 5, 100),
(3, 1, 10), (3, 2, 10),
(4, 6, 100), (4, 7, 100),
(5, 1, 20), (5, 3, 40),
(6, 8, 50),
(7, 2, 15), (7, 4, 15),
(8, 6, 50), (8, 7, 50),
(9, 5, 30),
(10, 1, 40), (10, 2, 40);

-- TRANSAÇÕES DE ESTOQUE (Entradas) - Datas de Junho
INSERT INTO inventory_transaction (item_id, transaction_type, quantity, reference_id, created_at) VALUES
(1, 'DONATION_IN', 50, 1, '2026-06-02 09:15:00'), (2, 'DONATION_IN', 50, 1, '2026-06-02 09:15:00'), (3, 'DONATION_IN', 50, 1, '2026-06-02 09:15:00'),
(4, 'DONATION_IN', 30, 2, '2026-06-05 14:30:00'), (5, 'DONATION_IN', 100, 2, '2026-06-05 14:30:00'),
(1, 'DONATION_IN', 10, 3, '2026-06-08 10:00:00'), (2, 'DONATION_IN', 10, 3, '2026-06-08 10:00:00'),
(6, 'DONATION_IN', 100, 4, '2026-06-12 11:45:00'), (7, 'DONATION_IN', 100, 4, '2026-06-12 11:45:00'),
(1, 'DONATION_IN', 20, 5, '2026-06-15 16:20:00'), (3, 'DONATION_IN', 40, 5, '2026-06-15 16:20:00'),
(8, 'DONATION_IN', 50, 6, '2026-06-18 08:50:00'),
(2, 'DONATION_IN', 15, 7, '2026-06-20 13:10:00'), (4, 'DONATION_IN', 15, 7, '2026-06-20 13:10:00'),
(6, 'DONATION_IN', 50, 8, '2026-06-25 15:00:00'), (7, 'DONATION_IN', 50, 8, '2026-06-25 15:00:00'),
(5, 'DONATION_IN', 30, 9, '2026-06-27 09:30:00'),
(1, 'DONATION_IN', 40, 10, '2026-06-28 14:00:00'), (2, 'DONATION_IN', 40, 10, '2026-06-28 14:00:00');

-- =====================================================================
-- 9. RETIRADAS (Espalhadas por Junho de 2026 - Mês 6)
-- Distribuído entre usuários 1, 2, 3 e 4
-- =====================================================================
INSERT INTO withdrawal (withdrawal_id, withdrawal_date, beneficiary_id, attendant_user_id) VALUES
(1, '2026-06-03 09:00:00', 1, 2),
(2, '2026-06-06 10:15:00', 2, 3),
(3, '2026-06-09 14:20:00', 3, 4),
(4, '2026-06-13 11:00:00', 4, 1),
(5, '2026-06-16 15:45:00', 5, 2),
(6, '2026-06-19 09:30:00', 6, 3),
(7, '2026-06-22 13:10:00', 7, 4),
(8, '2026-06-26 10:00:00', 1, 1),
(9, '2026-06-29 16:00:00', 2, 2);

-- ITENS RETIRADOS (Saídas)
INSERT INTO item_withdrawn (withdrawal_id, item_id, quantity) VALUES
(1, 1, 2), (1, 2, 2), (1, 3, 3),
(2, 4, 1), (2, 5, 2), (2, 6, 4),
(3, 1, 3), (3, 2, 3), (3, 8, 1),
(4, 5, 3), (4, 7, 2), (4, 8, 2),
(5, 1, 2), (5, 4, 1), (5, 6, 3),
(6, 2, 2), (6, 3, 4), (6, 7, 2),
(7, 1, 2), (7, 5, 4), (7, 6, 2),
(8, 8, 2), (8, 3, 2), 
(9, 5, 2), (9, 7, 1);

-- TRANSAÇÕES DE ESTOQUE (Saídas) - Datas de Junho
INSERT INTO inventory_transaction (item_id, transaction_type, quantity, reference_id, created_at) VALUES
(1, 'WITHDRAWAL_OUT', 2, 1, '2026-06-03 09:00:00'), (2, 'WITHDRAWAL_OUT', 2, 1, '2026-06-03 09:00:00'), (3, 'WITHDRAWAL_OUT', 3, 1, '2026-06-03 09:00:00'),
(4, 'WITHDRAWAL_OUT', 1, 2, '2026-06-06 10:15:00'), (5, 'WITHDRAWAL_OUT', 2, 2, '2026-06-06 10:15:00'), (6, 'WITHDRAWAL_OUT', 4, 2, '2026-06-06 10:15:00'),
(1, 'WITHDRAWAL_OUT', 3, 3, '2026-06-09 14:20:00'), (2, 'WITHDRAWAL_OUT', 3, 3, '2026-06-09 14:20:00'), (8, 'WITHDRAWAL_OUT', 1, 3, '2026-06-09 14:20:00'),
(5, 'WITHDRAWAL_OUT', 3, 4, '2026-06-13 11:00:00'), (7, 'WITHDRAWAL_OUT', 2, 4, '2026-06-13 11:00:00'), (8, 'WITHDRAWAL_OUT', 2, 4, '2026-06-13 11:00:00'),
(1, 'WITHDRAWAL_OUT', 2, 5, '2026-06-16 15:45:00'), (4, 'WITHDRAWAL_OUT', 1, 5, '2026-06-16 15:45:00'), (6, 'WITHDRAWAL_OUT', 3, 5, '2026-06-16 15:45:00'),
(2, 'WITHDRAWAL_OUT', 2, 6, '2026-06-19 09:30:00'), (3, 'WITHDRAWAL_OUT', 4, 6, '2026-06-19 09:30:00'), (7, 'WITHDRAWAL_OUT', 2, 6, '2026-06-19 09:30:00'),
(1, 'WITHDRAWAL_OUT', 2, 7, '2026-06-22 13:10:00'), (5, 'WITHDRAWAL_OUT', 4, 7, '2026-06-22 13:10:00'), (6, 'WITHDRAWAL_OUT', 2, 7, '2026-06-22 13:10:00'),
(8, 'WITHDRAWAL_OUT', 2, 8, '2026-06-26 10:00:00'), (3, 'WITHDRAWAL_OUT', 2, 8, '2026-06-26 10:00:00'),
(5, 'WITHDRAWAL_OUT', 2, 9, '2026-06-29 16:00:00'), (7, 'WITHDRAWAL_OUT', 1, 9, '2026-06-29 16:00:00');