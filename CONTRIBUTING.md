# 🤝 Guia de Contribuição

Bem-vindo(a) ao guia de contribuição do nosso projeto! Para mantermos o repositório organizado e o histórico limpo, adotamos algumas regras simples baseadas no **GitHub Flow** e no **Conventional Commits**.

Por favor, leia atentamente antes de começar a desenvolver.

---

## 🌿 1. Regras de Branches

Nossa branch principal é a `main`. **Ela é protegida e deve estar sempre funcional.** Nunca faça commits diretamente nela.

Toda tarefa deve ter uma **issue associada**, para termos maior controle.

Para iniciar qualquer trabalho, você deve criar uma branch a partir da `main`.
_Obs.:_ Tenha certeza que a `main` está atualizada antes de criar sua branch, com `git pull`.

### Padrão de Nomenclatura

O nome da sua branch deve indicar o **tipo** da tarefa, o **número da issue** associada e uma **descrição curta**.

**Formato:** `tipo/numero-issue-descricao-curta`

**Exemplos:**

- `feat/12-tela-de-login` (Para desenvolvimento de uma feature)
- `fix/15-botao-quebrado` (Para correção de um bug)
- `docs/3-criar-contributing` (Para documentações)

_Leitura recomendada:_ [Entendendo o GitHub Flow](https://docs.github.com/pt/get-started/using-github/github-flow)

---

## 💬 2. Padrões de Commits

Nós utilizamos o padrão **[Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/)**. Isso significa que toda mensagem de commit deve seguir uma estrutura específica.

**Formato:** `tipo: descrição breve em letras minúsculas`

### Tipos permitidos:

- `feat:` Uma nova funcionalidade ou recurso.
- `fix:` Correção de um bug.
- `docs:` Alterações apenas na documentação (README, diagrams, etc).
- `style:` Alterações de formatação (espaços, ponto e vírgula, etc) que não afetam o código.
- `refactor:` Uma mudança no código que não corrige um bug nem adiciona uma feature (ex: renomear variáveis, simplificar lógica).
- `test:` Adição ou correção de testes.
- `chore:` Atualizações de tarefas de build, configurações ou pacotes.

### Boas Práticas de Commits:

1. **Faça commits pequenos e frequentes:** Não crie um único commit com 50 arquivos alterados. Comite cada alteração lógica separadamente.
2. **Seja descritivo:** "fix: corrige erro no botão de salvar" é muito melhor que "arrumando coisas".
3. **Use o imperativo:** Escreva "adiciona funcionalidade X" ao invés de "adicionei funcionalidade X".

---
