-- ==========================================
-- 1. CRIAÇÃO DE TIPOS (ENUMS)
-- ==========================================
CREATE TYPE perfil_usuario AS ENUM ('ADMINISTRADOR', 'FUNCIONARIO');
CREATE TYPE status_beneficiario AS ENUM ('EM_ANALISE', 'APROVADO', 'REPROVADO', 'BLOQUEADO');
CREATE TYPE status_item_doacao AS ENUM ('AGUARDANDO_TRIAGEM', 'DISPONIBILIZADO', 'INADEQUADO');
CREATE TYPE genero_item AS ENUM ('MASCULINO', 'FEMININO', 'INFANTIL', 'UNISSEX', 'NAO_APLICAVEL');


-- ==========================================
-- 2. TABELAS DE USUÁRIOS E PESSOAS
-- ==========================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil perfil_usuario NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE
);

CREATE TABLE beneficiarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo VARCHAR(30),
    contato VARCHAR(20),
    endereco TEXT,
    composicao_familiar INTEGER CHECK (composicao_familiar > 0),
    situacao_vulnerabilidade TEXT,
    status status_beneficiario DEFAULT 'EM_ANALISE',
    limite_mensal_itens INTEGER DEFAULT 10,  -- Configurável pelo administrador
    usuario_aprovacao_id UUID REFERENCES usuarios(id),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 3. CARTÃO VIRTUAL E CATÁLOGO/ESTOQUE
-- ==========================================
CREATE TABLE cartoes_virtuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiario_id UUID UNIQUE NOT NULL REFERENCES beneficiarios(id) ON DELETE cascade,
    codigo_cartao UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome TEXT UNIQUE NOT NULL  -- Ex: Roupas, Calçados, Utensílios
);

CREATE TABLE itens (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    tipo TEXT NOT NULL,
    genero genero_item NOT NULL,
    tamanho VARCHAR(20) NOT NULL,
    descricao TEXT,
    quantidade_disponivel INTEGER DEFAULT 0,
    CONSTRAINT ck_estoque_positivo CHECK (quantidade_disponivel >= 0),  -- O estoque nunca pode ficar negativo
    CONSTRAINT uk_item_catalogo UNIQUE (categoria_id, tipo, genero, tamanho, descricao)  -- Evita duplicidade do mesmo tipo de item no catálogo
);


-- ==========================================
-- 4. GESTÃO DE DOAÇÕES (ENTRADAS)
-- ==========================================
CREATE TABLE doacoes (
    id SERIAL PRIMARY KEY,
    doador_id UUID NOT NULL REFERENCES doadores(id),
    usuario_recebedor_id UUID NOT NULL REFERENCES usuarios(id),
    data_recebimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_doacao (
    id SERIAL PRIMARY KEY,
    doacao_id INTEGER NOT NULL REFERENCES doacoes(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES itens(id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    status status_item_doacao DEFAULT 'AGUARDANDO_TRIAGEM',
    usuario_triador_id UUID REFERENCES usuarios(id),
    data_triagem TIMESTAMP
);


-- ==========================================
-- 5. GESTÃO DE RETIRADAS (SAÍDAS)
-- ==========================================
CREATE TABLE retiradas (
    id SERIAL PRIMARY KEY,
    cartao_id UUID NOT NULL REFERENCES cartoes_virtuais(id),
    usuario_registrador_id UUID NOT NULL REFERENCES usuarios(id),
    data_retirada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_retirada (
    id SERIAL PRIMARY KEY,
    retirada_id INTEGER NOT NULL REFERENCES retiradas(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES itens(id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0)
);


-- ==========================================
-- 6. ÍNDICES PARA OTIMIZAÇÃO DE RELATÓRIOS
-- ==========================================
CREATE INDEX idx_itens_doacao_status ON itens_doacao(status);
CREATE INDEX idx_retiradas_data ON retiradas(data_retirada);
CREATE INDEX idx_doacoes_data ON doacoes(data_recebimento);
CREATE INDEX idx_itens_categoria ON itens(categoria_id);
