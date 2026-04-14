# Requisitos Funcionais (RF)

| ID   | Descrição |
|------|----------|
| RF01 | O administrador e o Funcionário podem realizar o cadastro, exclusão e atualização de Beneficiários (cpf, nome, data de nascimento, sexo, contato, endereço, composição familiar e situação de vulnerabilidade) |
| RF02 | O administrador e o Funcionário podem realizar o cadastro, exclusão e atualização de Doadores (cpf, nome, data de nascimento) |
| RF03 | O administrador e o Funcionário devem poder registrar uma doação informando os itens entregues (tipo, gênero, tamanho, descrição, quantidade e data) e o doador |
| RF04 | O administrador e o Funcionário devem poder registrar a retirada informando os itens (tipo, gênero, tamanho, descrição, quantidade e data) que serão vinculados ao cartão virtual do beneficiário |
| RF05 | O sistema deve gerar um cartão virtual (PDF/imagem) vinculado ao cadastro do beneficiário |
| RF06 | O administrador e o Funcionário devem poder visualizar o saldo atualizado das doações disponíveis, permitindo a consulta rápida por categorias |
| RF07 | O sistema deve gerar relatórios das doações recebidas em um determinado período, com filtros por categoria e doador |
| RF08 | O sistema deve gerar relatórios das doações distribuídas em um determinado período, com filtros por categoria e beneficiário |
| RF09 | O administrador e o Funcionário devem poder classificar as doações disponibilizando ou excluindo itens caso o mesmo seja inadequado para doação (danificados, impróprios) |
| RF10 | O administrador deve poder consultar e gerar relatório do histórico de retirada de itens, beneficiários atendidos e distribuição por período |
| RF11 | O administrador deve poder analisar e aprovar ou reprovar solicitações de cadastro de beneficiários, além de poder bloquear cadastros já aprovados anteriormente (alteração de status) |

---

# Requisitos Não Funcionais (RNF)

| ID    | Descrição |
|-------|----------|
| RNF01 | Os dados dos usuários devem ser criptografados |
| RNF02 | O sistema deve exigir autenticação com o perfil de Administrador ou Funcionário para acessar as funcionalidades |
| RNF03 | O sistema deve ser uma aplicação web responsiva (desktop, tablets e mobile) |
| RNF04 | A interface deve ser simples e direta, tendo o objetivo de agilizar e facilitar o processo de gerenciamento das doações |
| RNF05 | A interface deve possuir boa acessibilidade |
| RNF06 | O sistema deve estar disponível durante os horários de funcionamento do brechó |
| RNF07 | O sistema deve realizar backup automático diário do banco de dados, com possibilidade de restauração em caso de falha |

---

# Regras de Negócio (RN)

| ID   | Descrição |
|------|----------|
| RN01 | Deve ser respeitado o limite mensal para a retirada de doações |
| RN02 | Para ter seu cadastro aprovado, o beneficiário deve atender aos requisitos estabelecidos |
| RN03 | A retirada de itens do brechó só pode ocorrer vinculada a um beneficiário com cadastro ativo e mediante a identificação do seu cartão |
| RN04 | O estoque nunca pode ficar negativo. Uma saída só pode ser registrada se houver aquele item disponível no sistema |
| RN05 | Cada beneficiário possui um limite mensal de itens configurável pelo administrador. Esse limite deve ser reiniciado no início de cada mês |

Quadro Kanban: [Acessar no ClickUp](https://app.clickup.com/9014570216/v/s/90144595278)