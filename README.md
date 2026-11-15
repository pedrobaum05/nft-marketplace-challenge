# NFT Marketplace

Aplicação web de um marketplace de NFTs desenvolvida como teste técnico para a Jungle Gaming, utilizando React, TypeScript e Vite.

**Aplicação publicada:** https://nft-marketplace-challenge-kappa.vercel.app

**Repositório:** https://github.com/pedrobaum05/nft-marketplace-challenge

## Tecnologias

- React 19 — construção da interface.
- TypeScript 6 — tipagem estática.
- Vite 8 — ferramenta de desenvolvimento e build.
- TanStack Router — roteamento.
- TanStack Query — gerenciamento de estado assíncrono e cache.
- Tailwind CSS 4 — estilização.
- Base UI — componentes de interface.
- Axios — comunicação HTTP.
- Decimal.js — operações com valores decimais, incluindo ETH.
- MSW 2 — simulação das APIs REST.
- Socket.IO Client — comunicação por eventos em tempo real.
- Playwright — testes automatizados E2E.
- Lighthouse — auditoria de qualidade e desempenho.

## Funcionalidades

- Cadastro, login e gerenciamento de sessão.
- Visualização e edição de perfil, incluindo nome e avatar.
- Alteração de senha.
- Catálogo de NFTs com pesquisa, filtros, ordenação e paginação.
- Visualização dos detalhes de NFTs.
- Adição, remoção e filtragem de favoritos.
- Carrinho de compras.
- Cotação e resumo do pedido.
- Aplicação de descontos e cálculo de taxa de rede.
- Checkout com criação de pedidos.
- Simulação de aprovação e recusa de pagamentos.
- Exibição dos estados dos pedidos: pendente, confirmado e recusado.
- Gerenciamento de carteiras simuladas.

## Executando localmente

### Pré-requisitos

- Node.js.
- npm.
- Git.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/pedrobaum05/nft-marketplace-challenge.git
```

Entre na pasta:

```bash
cd nft-marketplace-challenge
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm run dev
```

O Vite disponibilizará o endereço local no terminal, normalmente:

```text
http://localhost:5173
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Executa a verificação TypeScript e gera o build de produção. |
| `npm run typecheck` | Verifica os tipos TypeScript da aplicação. |
| `npm run typecheck:e2e` | Verifica os tipos dos testes E2E. |
| `npm run lint` | Executa o ESLint. |
| `npm run test:e2e` | Executa os testes automatizados com Playwright. |
| `npm run test:e2e:ui` | Abre a interface do Playwright. |
| `npm run test:e2e:report` | Abre o relatório HTML dos testes. |
| `npm run preview` | Executa uma prévia local do build de produção. |

## Testes e validações

O projeto utiliza Playwright para validar os principais fluxos da aplicação.

### Cenários cobertos

- Cadastro e autenticação.
- Validação de credenciais e e-mails duplicados.
- Proteção de rotas e logout.
- Catálogo, pesquisa, ordenação e paginação.
- Favoritos.
- Carrinho.
- Checkout e criação de pedidos.
- Aprovação e recusa simuladas.
- Nova tentativa após recusa.
- Estado pendente do pedido.
- Regressão visual em desktop e mobile.

### Resultados da última validação

- **25 testes E2E aprovados.**
- Typecheck da aplicação aprovado.
- Typecheck dos testes E2E aprovado anteriormente.
- Build de produção concluído.
- ESLint executado sem erros.

O ESLint apresentou um aviso relacionado a uma diretiva `eslint-disable` não utilizada no arquivo gerado `public/mockServiceWorker.js`. Não foram identificados erros de lint.

### Lighthouse

Foram gerados três relatórios de auditoria Lighthouse para a página inicial em perfil mobile.

As pontuações variaram entre as execuções. Os relatórios não representam uma auditoria completa de todas as páginas ou dispositivos.

Os arquivos estão disponíveis no diretório `lighthouse-reports/`.

## Observações e limitações

### API e persistência

A aplicação utiliza Mock Service Worker (MSW) para interceptar e simular as requisições da API. O MSW também é inicializado no ambiente publicado.

Os dados de autenticação, carteiras e pedidos são simulados e armazenados localmente no navegador. Não existe um backend persistente compartilhado entre usuários ou dispositivos.

Consequentemente, os dados de demonstração de cada avaliador são independentes.

### Autenticação

O fluxo de autenticação é simulado pelo MSW. O armazenamento local de credenciais não representa uma implementação adequada para um sistema real de produção.

### Pagamentos

Não existe integração com uma carteira blockchain ou gateway de pagamento real.

O checkout cria pedidos simulados. As opções de simular aprovação e recusa estão disponíveis também no ambiente publicado, permitindo testar os diferentes estados do pedido.

**Nenhuma transação financeira real é realizada.**

### Rede e taxa

A taxa de rede exibida no checkout utiliza valores simulados. Não há integração com uma rede blockchain real nem seleção dinâmica de redes no fluxo atualmente implementado.

### Socket.IO

A integração de eventos foi implementada, mas apresentou desconexões e reconexões durante os testes. A estabilidade da comunicação em tempo real não foi validada.

### Rotas

A navegação interna da aplicação foi validada. Durante a verificação em produção, o acesso direto à rota `/account` retornou 404, embora a página tenha funcionado ao acessá-la pelo menu da aplicação. Esse comportamento permanece como ponto de atenção.

## Deploy

A aplicação está publicada na Vercel:

https://nft-marketplace-challenge-kappa.vercel.app

A branch configurada para produção é `develop`.

## Autor

Desenvolvido por Pedro Baum como parte do teste técnico de Frontend da Jungle Gaming.
