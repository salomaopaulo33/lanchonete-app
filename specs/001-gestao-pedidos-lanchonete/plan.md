# Plano de Implementação: Gestão de Pedidos da Lanchonete

**Branch**: `001-gestao-pedidos-lanchonete` | **Data**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `specs/001-gestao-pedidos-lanchonete/spec.md`

## Resumo

Construir um sistema web para uma lanchonete que permite: (1) o cliente montar e enviar pedidos por um cardápio digital (hambúrgueres, bebidas, lanches, saladas); (2) processar o pagamento do pedido (pix, cartão ou dinheiro na entrega); (3) o gerente acompanhar os recebimentos financeiros; (4) organizar pedidos de entrega em rotas com entregadores; e (5) coletar a avaliação do cliente sobre o atendimento após a conclusão do pedido.

Abordagem técnica: aplicação web full-stack em **Next.js** com banco de dados e autenticação em **Supabase**, seguindo o mesmo padrão de stack já usado em outros projetos do usuário (ex.: `FinancasAPP`), o que facilita manutenção e reaproveitamento de conhecimento.

## Contexto Técnico

**Linguagem/Versão**: TypeScript, Node.js 20+, Next.js 15 (App Router), React 19

**Dependências Principais**: Next.js, Supabase (Postgres + Auth + Realtime + Storage), Tailwind CSS, shadcn/ui, gateway de pagamento com suporte a Pix (decisão em `research.md`)

**Armazenamento**: Supabase Postgres (pedidos, pagamentos, cardápio, rotas, avaliações); Supabase Storage (fotos dos itens do cardápio)

**Testes**: Vitest (testes unitários/integração) + Playwright (testes ponta a ponta dos fluxos de pedido, pagamento e avaliação)

**Plataforma Alvo**: Aplicação web responsiva (celular e computador), hospedada na Vercel

**Tipo de Projeto**: Aplicação web full-stack (frontend + backend integrados no Next.js)

**Metas de Performance**: Alinhadas aos Critérios de Sucesso do spec — pedido montado em até 3 min (SC-001); confirmação de pagamento em até 30s (SC-002); relatório de recebimentos carregado em até 1 min (SC-003)

**Restrições**: Deve funcionar bem em conexões móveis instáveis (clientes e entregadores usando dados móveis); Pix precisa de confirmação de pagamento praticamente em tempo real

**Escala/Escopo**: Uma única lanchonete (uma loja), dezenas a poucas centenas de pedidos por dia na fase inicial; sem suporte a múltiplas filiais nesta versão

## Verificação da Constituição

*GATE: Deve passar antes da Fase 0 de pesquisa. Reverificar após o design da Fase 1.*

**Reverificação pós-design (constituição v1.0.0)**:

- **I. Objetividade e Eficiência**: OK — cada história de usuário resolve uma necessidade direta do negócio (pedido, pagamento, recebimento, entrega, avaliação); nenhuma funcionalidade especulativa foi incluída no escopo desta versão (ex.: otimização automática de rota e API oficial do WhatsApp foram propositalmente adiadas em `research.md`).
- **II. Usabilidade Autoexplicativa**: OK — nenhuma decisão técnica desta fase contraria esse princípio; a validação real do texto/fluxo das telas acontecerá na implementação e deve ser conferida manualmente contra este princípio antes de considerar a funcionalidade pronta.
- **III. Identidade Visual e Conteúdo Configuráveis**: atendido pelo desenho — `Tailwind CSS` com tokens de tema central (paleta provisória até ser substituída) e cadastro de itens do cardápio via painel administrativo (Supabase + rotas `/admin`), cobertos pelos novos requisitos FR-013 e FR-014 do spec.

Nenhuma violação identificada; nada a registrar em "Rastreamento de Complexidade".

## Estrutura do Projeto

### Documentação (desta funcionalidade)

```text
specs/001-gestao-pedidos-lanchonete/
├── plan.md              # Este arquivo
├── research.md          # Saída da Fase 0
├── data-model.md        # Saída da Fase 1
├── quickstart.md        # Saída da Fase 1
├── contracts/           # Saída da Fase 1
└── tasks.md             # Saída da Fase 2 (/speckit-tasks, ainda não criado)
```

### Código-fonte (raiz do repositório)

```text
lanchonete-app/
├── app/
│   ├── (cliente)/                 # Grupo de rotas (sem prefixo na URL): cardápio, pedido, pagamento, avaliação
│   ├── admin/                     # Painel da lanchonete (URL /admin/...): recebimentos, rotas, avaliações, cardápio, configurações
│   ├── entregador/                # Tela do entregador (URL /entregador/...)
│   ├── login/                     # Login da equipe (Supabase Auth)
│   └── api/
│       ├── menu/                  # Endpoints do cardápio
│       ├── orders/                # Endpoints de pedidos
│       ├── payments/              # Endpoints e webhook de pagamento
│       ├── delivery-routes/       # Endpoints de rotas de entrega
│       ├── reviews/                # Endpoints de avaliação
│       └── tema/                  # Endpoint da paleta de cores configurável
├── components/                    # Componentes de interface (shadcn/ui) e telas (cardapio/, carrinho/, pedido/, admin/, entregador/)
├── lib/
│   ├── supabase/                  # Cliente e helpers do Supabase
│   ├── payments/                  # Integração com o gateway de pagamento
│   ├── theme/                     # Tokens de cor centralizados (paleta provisória → oficial, FR-014)
│   ├── notifications/             # Geração de links de aviso por WhatsApp
│   └── domain/                    # Regras de negócio (cálculo de total, transições de status, etc.)
├── proxy.ts                       # Proteção de rotas /admin e /entregador (antigo "middleware")
├── supabase/
│   └── migrations/                # Esquema do banco (pedidos, pagamentos, cardápio, rotas, avaliações, tema)
└── tests/
    ├── unit/
    └── e2e/
```

**Decisão de Estrutura**: Aplicação Next.js única (sem projetos separados de frontend/backend). A área do cliente usa um grupo de rotas `(cliente)` (não aparece na URL, já que é a experiência padrão do site); a área administrativa e a do entregador usam pastas reais `admin/` e `entregador/`, para que `proxy.ts` possa proteger essas URLs por prefixo. O backend fica nas rotas de API do próprio Next.js, e o banco de dados/autenticação ficam no Supabase. Essa estrutura é a mais simples que atende a todas as histórias de usuário do spec, evitando a complexidade de manter projetos de frontend e backend separados.

## Rastreamento de Complexidade

*Não aplicável — a Verificação da Constituição não identificou violações a justificar.*
