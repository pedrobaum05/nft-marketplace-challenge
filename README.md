
# NFT Marketplace

Aplicação web de um marketplace de NFTs desenvolvida como teste técnico para a Jungle Gaming, utilizando React, TypeScript e Vite.

**Aplicação publicada:** https://nft-marketplace-challenge-kappa.vercel.app

**Repositório:** https://github.com/pedrobaum05/nft-marketplace-challenge

## Tecnologias

- **React 19** — construção da interface.
- **TypeScript 6** — tipagem estática.
- **Vite 8** — ferramenta de desenvolvimento e build.
- **TanStack Router** — roteamento.
- **TanStack Query** — gerenciamento de estado assíncrono e cache.
- **Tailwind CSS 4** — estilização.
- **Base UI** — componentes de interface.
- **Axios** — comunicação HTTP.
- **Decimal.js** — operações com valores decimais, incluindo ETH.
- **MSW 2** — simulação das APIs REST.
- **Socket.IO Client** — comunicação por eventos em tempo real.
- **Playwright** — testes automatizados E2E.
- **Lighthouse** — auditoria de qualidade e desempenho.

## Funcionalidades

- Cadastro, login e gerenciamento de sessão.
- Catálogo de NFTs com pesquisa, filtros, ordenação e paginação.
- Visualização de detalhes de NFTs.
- Adição e remoção de favoritos.
- Carrinho de compras.
- Cotação e resumo do pedido.
- Processo de checkout com criação de pedidos.
- Simulação de estados de pedido: pendente, confirmado e recusado.
- Integração simulada de eventos para atualizações de NFTs e pedidos.

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

Inicie o servidor de desenvolvimento:

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

O projeto utiliza Playwright para validar fluxos da aplicação.

Cenários cobertos:

- Catálogo, pesquisa, ordenação e paginação.
- Cadastro, autenticação e proteção de rotas.
- Favoritos.
- Carrinho.
- Checkout e estados de pedidos.
- Regressão visual em resoluções desktop e mobile.

**Resultados registrados durante o desenvolvimento:**

- 17 testes E2E aprovados na execução registrada.
- 8 verificações de regressão visual aprovadas.
- Typecheck da aplicação e dos testes aprovado.
- Build de produção concluído.
- ESLint executado sem erros; foi registrado um aviso em arquivo gerado pelo MSW.

As auditorias Lighthouse foram realizadas na página inicial em perfil mobile. As pontuações variaram entre as execuções, portanto não representam uma garantia de desempenho em todos os dispositivos e páginas.

## Observações e limitações

### API e persistência

A aplicação utiliza Mock Service Worker (MSW) para interceptar e simular as requisições da API. Os dados e comportamentos apresentados são simulados, não correspondendo a um backend de produção.

O MSW também é inicializado no ambiente publicado.

### Pagamentos

Não existe integração com uma carteira ou gateway de pagamento real. O checkout cria pedidos simulados, e as ações de aprovação e recusa estão disponíveis somente no ambiente de desenvolvimento. Por isso, um pedido pode permanecer com status pendente na aplicação publicada.

### Socket.IO

A integração de eventos foi implementada, mas a conexão apresenta desconexões e reconexões durante a execução. Essa limitação permanece conhecida e não foi considerada validada como uma conexão estável em tempo real.

## Deploy

A aplicação está publicada na Vercel:

https://nft-marketplace-challenge-kappa.vercel.app

A branch utilizada para produção é `develop`.

---

Desenvolvido por **Pedro Baum** como parte do teste técnico de Frontend da Jungle Gaming.