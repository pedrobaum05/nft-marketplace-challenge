# Architecture — NFT Marketplace

## 1. Visão geral

O NFT Marketplace é uma aplicação frontend construída com React e TypeScript. Sua arquitetura separa responsabilidades entre interface, roteamento, hooks, serviços, modelos de dados e simulação de API.

A comunicação HTTP é interceptada pelo Mock Service Worker (MSW), que simula o comportamento de um backend REST. Dessa forma, a aplicação consegue demonstrar os principais fluxos de um marketplace sem depender de um servidor externo.

## 2. Stack e responsabilidades

| Tecnologia | Responsabilidade |
|---|---|
| React 19 | Interface baseada em componentes. |
| TypeScript 6 | Tipagem estática. |
| Vite 8 | Desenvolvimento e build. |
| TanStack Router | Rotas e navegação. |
| TanStack Query | Cache e gerenciamento de dados assíncronos. |
| Tailwind CSS 4 | Estilização. |
| Base UI | Componentes de interface. |
| Axios | Cliente HTTP. |
| Decimal.js | Precisão em operações decimais. |
| MSW 2 | Interceptação e simulação das APIs. |
| Socket.IO Client | Comunicação por eventos. |
| Playwright | Testes E2E e regressão visual. |

## 3. Organização do código

A pasta `src/` concentra a implementação da aplicação.

```text
src/
├── assets/
├── components/
│   ├── auth/
│   ├── layout/
│   └── ui/
├── hooks/
├── lib/
├── mocks/
│   ├── data/
│   ├── handlers/
│   └── scenarios/
├── pages/
├── router/
├── services/
├── types/
├── App.tsx
├── index.css
└── main.tsx
```

### Responsabilidade das pastas

- `assets/`: recursos estáticos da aplicação.
- `components/`: componentes reutilizáveis, organizados por responsabilidade.
- `hooks/`: hooks para autenticação, NFTs, favoritos, carrinho, pedidos, carteiras e eventos.
- `lib/`: utilitários compartilhados, configuração do Query Client e operações decimais.
- `mocks/`: configuração do MSW, dados simulados e handlers das APIs.
- `pages/`: páginas e telas da aplicação.
- `router/`: configuração das rotas, layouts e proteção de páginas.
- `services/`: comunicação HTTP e operações de acesso aos recursos.
- `types/`: contratos e modelos TypeScript.

## 4. Fluxo de comunicação

O fluxo principal de dados segue esta organização:

```text
Usuário
   |
   v
Página / Componente React
   |
   v
Custom Hook
   |
   v
Service
   |
   v
Axios / HTTP
   |
   v
MSW
   |
   v
Handler correspondente
   |
   v
Resposta simulada
   |
   v
TanStack Query / Interface
```

Os componentes de interface não precisam conhecer os detalhes internos dos handlers. Os hooks concentram a lógica de consulta e mutação, enquanto os serviços centralizam as chamadas HTTP.

## 5. Roteamento e autenticação

O roteamento utiliza TanStack Router.

As páginas protegidas passam pelo componente `ProtectedRoute`, que verifica a sessão do usuário antes de permitir o acesso.

O fluxo de autenticação é simulado pelos handlers do MSW. A aplicação possui operações de cadastro, login, recuperação da sessão e logout.

As informações de sessão e usuário são mantidas no armazenamento local do navegador pela implementação simulada.

**Limitação:** a autenticação não representa um sistema de identidade de produção. Não existe backend real responsável pela validação e persistência segura de credenciais.

## 6. Gerenciamento de dados

O TanStack Query é utilizado para organizar consultas, cache e mutações.

Os hooks separam o acesso aos dados da apresentação visual. Entre os principais estão:

- `use-auth`: autenticação e sessão.
- `use-nfts` e `use-nft`: catálogo e detalhes de NFTs.
- `use-favorites`: gerenciamento de favoritos.
- `use-cart`: gerenciamento do carrinho.
- `use-orders`: consultas e operações de pedidos.
- `use-wallets`: carteiras.
- `use-socket-events`: integração de eventos.

As chaves de consulta consideram os recursos e, quando necessário, o usuário autenticado para evitar misturar dados de diferentes sessões no cache.

## 7. Simulação de API com MSW

O MSW intercepta as requisições da aplicação e responde utilizando handlers locais.

Os handlers estão organizados por domínio:

- `auth.ts`: autenticação e sessão.
- `wallets.ts`: carteiras.
- `favorites.ts`: favoritos.
- `cart.ts`: carrinho.
- `quote.ts`: cotações.
- `checkout.ts`: checkout.
- `order.ts`: pedidos.
- `socket.ts`: comunicação simulada por eventos.

Os dados iniciais de NFTs ficam em `mocks/data/nfts.ts`.

O Service Worker é inicializado em `main.tsx`, inclusive no ambiente publicado. Portanto, a aplicação publicada continua utilizando a API simulada, e não um backend de produção.

## 8. Valores monetários e precisão

Os valores monetários são representados por strings decimais nos contratos de dados, evitando depender de operações de ponto flutuante nativo do JavaScript.

A biblioteca Decimal.js é utilizada para cálculos que exigem precisão, especialmente em valores ETH.

Quantidades de itens permanecem inteiras.

Essa abordagem reduz erros de arredondamento em operações como subtotal, desconto, taxa de rede e total.

## 9. Carrinho e checkout

O fluxo de compra utiliza os recursos de carrinho, cotação e pedidos.

De forma simplificada:

1. O usuário adiciona NFTs ao carrinho.
2. A aplicação consulta a cotação.
3. O checkout utiliza a cotação e a carteira selecionada.
4. A criação do pedido exige uma chave `Idempotency-Key`.
5. O handler verifica a validade da cotação e os dados da compra.
6. O pedido é criado inicialmente com status `pending`.
7. O status pode ser atualizado para `confirmed` ou `declined` na simulação.

A chave de idempotência evita a criação de pedidos duplicados para a mesma operação dentro do comportamento implementado.

**Limitação:** não existe integração com gateway de pagamento ou processamento real de transações blockchain. As atualizações de aprovação e recusa são mecanismos de simulação disponíveis no ambiente de desenvolvimento. Na aplicação publicada, um pedido pode permanecer pendente.

## 10. Comunicação por eventos

A integração utiliza Socket.IO Client e handlers simulados pelo MSW.

Os eventos considerados na implementação incluem:

- `nft.updated`: atualização de informações de NFTs.
- `order.updated`: atualização do status de pedidos.

O hook `use-socket-events` concentra a integração com a conexão e o tratamento dos eventos.

**Limitação conhecida:** durante os testes, a conexão apresentou desconexões por timeout e tentativas de reconexão. A implementação foi mantida, mas a estabilidade da comunicação contínua não foi comprovada. Essa limitação não deve ser interpretada como uma integração em tempo real plenamente validada.

## 11. Testes e qualidade

O projeto utiliza Playwright para testes automatizados.

Os cenários implementados cobrem:

- Catálogo, pesquisa, ordenação e paginação.
- Cadastro e autenticação.
- Proteção de rotas.
- Favoritos.
- Carrinho.
- Checkout e estados dos pedidos.
- Regressão visual em desktop e mobile.

A regressão visual utiliza snapshots do Playwright.

O Lighthouse foi utilizado para auditorias de performance, acessibilidade, boas práticas e SEO. As execuções da página inicial em perfil mobile apresentaram variações de pontuação; os resultados devem ser interpretados como medições daquele ambiente e momento, não como garantia de desempenho geral.

## 12. Build e validação

Comandos principais:

```bash
npm run typecheck
npm run typecheck:e2e
npm run lint
npm run test:e2e
npm run build
```

Para executar a aplicação localmente:

```bash
npm install
npm run dev
```

## 13. Deploy

A aplicação está hospedada na Vercel.

- Repositório: https://github.com/pedrobaum05/nft-marketplace-challenge
- Aplicação: https://nft-marketplace-challenge-kappa.vercel.app
- Branch de produção: `develop`

O deploy publicado utiliza o frontend e os handlers simulados pelo MSW.

## 14. Limitações e próximos passos

As seguintes limitações são conhecidas nesta entrega:

1. Não há backend REST real ou banco de dados de produção.
2. Não há integração real com gateway de pagamento.
3. Pedidos podem permanecer pendentes no ambiente publicado.
4. A conexão Socket.IO apresenta instabilidade por timeout.
5. As auditorias Lighthouse apresentaram variação entre execuções.
6. Os cenários de falha do MSW ainda precisam de validação e cobertura específica.

Esses pontos delimitam o comportamento efetivamente implementado e indicam oportunidades de evolução para uma versão conectada a serviços reais.