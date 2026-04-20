USE sanem;

-- ========================
-- PROFILE
-- ========================
INSERT INTO profile (name, description) VALUES
                                            ('Administrator', 'Full system access'),
                                            ('Attendant', 'Performs registrations and withdrawals'),
                                            ('Evaluator', 'Approves or rejects beneficiaries');

-- ========================
-- APP_USER
-- ========================
INSERT INTO app_user (name, login, email, password_hash, status, profile_id) VALUES
                                                                                 ('Vitor Paladini', 'paladini-adm', 'paladini-adm@gmail.com', '$2a$10$54XF3HlwMqdn0XuyO7uHauB8CeonOjr4i.icnP4YUrgabp9eh.Y.a', 'ACTIVE', 1),
                                                                                 ('Vitor Paladini', 'paladini-atd', 'paladini-atd@gmail.com', '$2a$10$54XF3HlwMqdn0XuyO7uHauB8CeonOjr4i.icnP4YUrgabp9eh.Y.a', 'ACTIVE', 2),
                                                                                 ('Vitor Paladini', 'paladini-eval', 'paladini-eval@gmail.com', '$2a$10$54XF3HlwMqdn0XuyO7uHauB8CeonOjr4i.icnP4YUrgabp9eh.Y.a', 'ACTIVE', 3);

-- ========================
-- BENEFICIARY
-- ========================
INSERT INTO beneficiary (full_name, cpf, address, phone, socioeconomic_data, beneficiary_status, approver_user_id) VALUES
                                                                                                                       ('Maria Oliveira', '111.111.111-11', 'Street A, 123', '11-99999-1111', 'Low income', 'APPROVED', 3),
                                                                                                                       ('José Santos', '222.222.222-22', 'Street B, 456', '11-99999-2222', 'Vulnerable situation', 'PENDING', NULL),
                                                                                                                       ('Clara Silva', '333.333.333-33', 'Street C, 789', '11-99999-3333', 'Unemployed', 'REJECTED', 3);

-- ========================
-- CARD
-- ========================
INSERT INTO card (unique_number, beneficiary_id) VALUES
                                                     ('CARD-001', 1),
                                                     ('CARD-002', 2),
                                                     ('CARD-003', 3);

-- ========================
-- CATEGORY
-- ========================
INSERT INTO category (name) VALUES
                                ('Food'),
                                ('Clothing'),
                                ('Hygiene');

-- ========================
-- ITEM
-- ========================
INSERT INTO item (description, stock_quantity, tag_code, category_id) VALUES
                                                                          ('Rice 5kg', 50, 'ETQ-RICE-01', 1),
                                                                          ('T-shirt M', 30, 'ETQ-TSHIRT-01', 2),
                                                                          ('Soap 90g', 100, 'ETQ-SOAP-01', 3);

-- ========================
-- DONOR
-- ========================
INSERT INTO donor (name, cpf_cnpj, contact) VALUES
                                                ('Good Price Supermarket', '12.345.678/0001-99', '11-4002-8922'),
                                                ('Maria Costa', '444.444.444-44', '11-98888-4444'),
                                                ('Solidarity Association', '98.765.432/0001-11', '11-97777-1234');

-- ========================
-- DONATION
-- ========================
INSERT INTO donation (receiver_user_id, donor_id) VALUES
                                                      (2, 1), -- Attendant receives donation from supermarket
                                                      (2, 2), -- Attendant receives donation from Maria
                                                      (1, 3); -- Administrator receives donation from association

-- ========================
-- WITHDRAWAL
-- ========================
INSERT INTO withdrawal (beneficiary_id, attendant_user_id) VALUES
                                                               (1, 2), -- Attendant attends Maria
                                                               (2, 2), -- Attendant attends José
                                                               (3, 2); -- Attendant attends Clara

-- ========================
-- ITEM_DONATED
-- ========================
INSERT INTO item_donated (donation_id, item_id, quantity) VALUES
                                                              (1, 1, 10), -- 10 rice bags
                                                              (2, 2, 5),  -- 5 t-shirts
                                                              (3, 3, 20); -- 20 soaps

-- ========================
-- ITEM_WITHDRAWN
-- ========================
INSERT INTO item_withdrawn (withdrawal_id, item_id, quantity) VALUES
                                                                  (1, 1, 2), -- Maria withdraws 2 rice bags
                                                                  (2, 2, 1), -- José withdraws 1 t-shirt
                                                                  (3, 3, 3); -- Clara withdraws 3 soaps
