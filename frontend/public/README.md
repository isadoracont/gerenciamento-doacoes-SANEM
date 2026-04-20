# Pasta Public - Imagens Estáticas

Esta pasta contém todas as imagens estáticas do projeto Next.js.

## Imagens Necessárias

Para que o projeto funcione corretamente, você precisa adicionar as seguintes imagens:

### 1. Logo da SANEM

- **Arquivo**: `logo-sanem.svg`
- **Usado em**: Página de login (`src/app/page.js`)
- **Dimensões recomendadas**: 120x120px

### 2. Imagem de Doação

- **Arquivo**: `doantion.jpg`
- **Usado em**: Página inicial (`src/app/home/page.js`)
- **Dimensões recomendadas**: 320x180px

## Como Adicionar Imagens

1. Coloque os arquivos de imagem diretamente nesta pasta `public`
2. No código, referencie as imagens com `/nome-do-arquivo.extensao`
3. Exemplo: `<Image src="/logo-sanem.svg" alt="Logo" />`

## Estrutura Esperada

```
public/
├── logo-sanem.svg
├── doantion.jpg
└── README.md
```

## Nota

No Next.js, arquivos na pasta `public` são servidos estaticamente e podem ser acessados diretamente pela URL raiz do site.
