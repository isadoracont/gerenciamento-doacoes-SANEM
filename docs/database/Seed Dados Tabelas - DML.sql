-- ==========================================
-- 1. LIMPEZA PRÉVIA
-- ==========================================
TRUNCATE TABLE itens_retirada, retiradas, itens_doacao, doacoes, itens, categorias, cartoes_virtuais, beneficiarios, doadores, usuarios RESTART IDENTITY CASCADE;

-- ==========================================
-- 2. USUÁRIOS DO SISTEMA
-- ==========================================
INSERT INTO usuarios (id, cpf, nome, data_nascimento, email, senha_hash, perfil, ativo, data_criacao) VALUES
('11111111-1111-1111-1111-111111111111', '12345678901', 'Carlos Silva (Gestor)', '1985-04-12', 'carlos.admin@sanem.org', '$2b$10$ExemploHashSeguroAqui123', 'ADMINISTRADOR', true, '2026-01-10 08:00:00'),
('22222222-2222-2222-2222-222222222222', '10987654321', 'Ana Souza (Triagem)', '1992-08-25', 'ana.func@sanem.org', '$2b$10$ExemploHashSeguroAqui456', 'FUNCIONARIO', true, '2026-01-15 09:30:00');

-- ==========================================
-- 3. DOADORES RECORRENTES
-- ==========================================
INSERT INTO doadores (id, cpf, nome, data_nascimento) VALUES
('33333333-3333-3333-3333-333333333333', '99988877766', 'Confecções Paraná Ltda', '2010-05-20'),
('44444444-4444-4444-4444-444444444444', '55544433322', 'Mariana Oliveira', '1988-11-30');

-- ==========================================
-- 4. BENEFICIÁRIOS (Fluxos de Status Diferentes)
-- ==========================================
INSERT INTO beneficiarios (id, cpf, nome, data_nascimento, sexo, contato, endereco, composicao_familiar, situacao_vulnerabilidade, status, limite_mensal_itens, usuario_aprovacao_id, data_cadastro) VALUES
-- Beneficiário 1: Aprovado e com limite padrão (10)
('55555555-5555-5555-5555-555555555555', '11122233344', 'Roberto Mendes', '1975-02-15', 'Masculino', '(45) 99999-1111', 'Rua Argentina, 123, Centro, Medianeira - PR', 4, 'Desempregado há 6 meses, moradia alugada.', 'APROVADO', 10, '11111111-1111-1111-1111-111111111111', '2026-03-20 10:00:00'),

-- Beneficiário 2: Aprovado, família grande, limite estendido (15)
('66666666-6666-6666-6666-666666666666', '22233344455', 'Juliana Castro', '1990-07-08', 'Feminino', '(45) 98888-2222', 'Av. das Cataratas, 456, Santa Terezinha de Itaipu - PR', 6, 'Mãe solo de 5 filhos, trabalho informal com baixa renda.', 'APROVADO', 15, '11111111-1111-1111-1111-111111111111', '2026-03-25 14:15:00'),

-- Beneficiário 3: Ainda em análise, sem usuário de aprovação
('77777777-7777-7777-7777-777777777777', '33344455566', 'Fernando Gomes', '1982-12-01', 'Masculino', '(45) 97777-3333', 'Rua Iguaçu, 789, Bairro Nazaré, Medianeira - PR', 2, 'Doença crônica na família dificultando o trabalho.', 'EM_ANALISE', 10, NULL, '2026-04-01 09:00:00');

-- ==========================================
-- 5. CARTÕES VIRTUAIS (Apenas para os aprovados)
-- ==========================================
INSERT INTO cartoes_virtuais (id, beneficiario_id, codigo_cartao, data_emissao, ativo) VALUES
('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', '2026-03-21 08:00:00', true),
('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '2026-03-26 08:00:00', true);

-- ==========================================
-- 6. CATEGORIAS E CATÁLOGO DE ITENS (ESTOQUE ATUAL)
-- ==========================================
INSERT INTO categorias (id, nome) VALUES
(1, 'Roupas'), 
(2, 'Calçados'), 
(3, 'Utensílios Domésticos'), 
(4, 'Cama, Mesa e Banho');

INSERT INTO itens (id, categoria_id, tipo, genero, tamanho, descricao, quantidade_disponivel) VALUES
(1, 1, 'Camiseta Básica', 'UNISSEX', 'M', 'Camiseta de algodão sem estampa', 15),
(2, 1, 'Calça Jeans', 'MASCULINO', '42', 'Calça jeans tradicional em bom estado', 5),
(3, 2, 'Tênis Esportivo', 'INFANTIL', '32', 'Tênis para uso escolar', 0), -- Zerado no momento
(4, 3, 'Prato Fundo', 'NAO_APLICAVEL', 'Único', 'Prato de vidro transparente', 24),
(5, 4, 'Cobertor', 'UNISSEX', 'Casal', 'Cobertor grosso de inverno', 8);

-- ==========================================
-- 7. DOAÇÕES RECEBIDAS E TRIAGEM
-- ==========================================
INSERT INTO doacoes (id, doador_id, usuario_recebedor_id, data_recebimento) VALUES
(1, '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '2026-03-28 10:00:00'),
(2, '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '2026-04-01 14:30:00');

INSERT INTO itens_doacao (id, doacao_id, item_id, quantidade, status, usuario_triador_id, data_triagem) VALUES
-- Doação 1 (Confecções Paraná) foi toda triada e disponibilizada
(1, 1, 1, 20, 'DISPONIBILIZADO', '11111111-1111-1111-1111-111111111111', '2026-03-29 09:00:00'),
(2, 1, 2, 5, 'DISPONIBILIZADO', '11111111-1111-1111-1111-111111111111', '2026-03-29 09:15:00'),

-- Doação 2 (Mariana) tem itens disponibilizados, recusados e parados
(3, 2, 4, 30, 'DISPONIBILIZADO', '22222222-2222-2222-2222-222222222222', '2026-04-02 10:00:00'),
(4, 2, 3, 2, 'AGUARDANDO_TRIAGEM', NULL, NULL), -- Ainda não foi pro estoque
(5, 2, 1, 3, 'INADEQUADO', '22222222-2222-2222-2222-222222222222', '2026-04-02 10:30:00'); -- Camisetas vieram rasgadas

-- ==========================================
-- 8. RETIRADAS DE BENEFICIÁRIOS
-- ==========================================
INSERT INTO retiradas (id, cartao_id, usuario_registrador_id, data_retirada) VALUES
(1, '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', '2026-04-03 11:00:00'), -- Roberto
(2, '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', '2026-04-04 13:45:00'); -- Juliana

INSERT INTO itens_retirada (id, retirada_id, item_id, quantidade) VALUES
-- Roberto retirou 3 Camisetas e 6 Pratos (Total: 9 itens, dentro do limite de 10)
(1, 1, 1, 3), 
(2, 1, 4, 6), 

-- Juliana retirou 2 Camisetas e 2 Cobertores (Total: 4 itens, dentro do limite de 15)
(3, 2, 1, 2), 
(4, 2, 5, 2);
