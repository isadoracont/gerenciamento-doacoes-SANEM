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

## 🔀 3. Fluxo de Pull Requests (PR)

Como a `main` é bloqueada, todo código novo deve entrar no projeto através de um Pull Request.

### Passo a passo para o PR:

1. Faça o `push` da sua branch para o GitHub: `git push origin nome-da-sua-branch`.
2. Acesse a aba **Pull Requests** no GitHub e clique em "New Pull Request".
3. Preencha o título (seguindo o Conventional Commits) e a descrição explicando o que foi feito.
4. **Referencie a Issue:** Na descrição do PR, escreva `Resolves #NumeroDaIssue` (ex: `Resolves #3`). Isso fará com que o GitHub feche a issue automaticamente quando o PR for aprovado.
5. **Revisão:** Todo PR precisa de pelo menos **1 aprovação (Approve)** de outro membro da equipe.
6. **Merge:** Após a aprovação e garantir que não há conflitos, o autor do PR (ou o revisor) pode clicar em "Merge pull request" para integrar o código à `main`.

⚠️ **Regra de Ouro:** NUNCA aprove o seu próprio Pull Request! Peça para um colega revisar.

_Leitura recomendada:_ [Como criar um Pull Request no GitHub](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
