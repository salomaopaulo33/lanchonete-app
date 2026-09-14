---
description: "Lista de tarefas para a funcionalidade Gestão de Pedidos da Lanchonete"
---

# Tarefas: Gestão de Pedidos da Lanchonete

**Entrada**: Documentos de design em `/specs/001-gestao-pedidos-lanchonete/`

**Pré-requisitos**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Testes**: Não foram pedidos testes formais (TDD) na especificação; as tarefas de teste incluídas na fase final são de validação geral, não obrigatórias por história.

**Organização**: As tarefas são agrupadas por história de usuário (do spec.md), para que cada uma possa ser construída e testada de forma independente.

## Formato: `[ID] [P?] [História?] Descrição`

- **[P]**: pode ser feita em paralelo (arquivo diferente, sem dependência de tarefa não concluída)
- **[História]**: a qual história de usuário a tarefa pertence (US1 a US5, mais US6 para as capacidades administrativas de suporte FR-013/FR-014)
- Cada tarefa indica o caminho exato do arquivo

## Convenção de Caminhos

Aplicação Next.js única (ver `plan.md` → Estrutura do Projeto):
`app/`, `components/`, `lib/`, `supabase/migrations/`, `tests/`

---

## Fase 1: Preparação (Infraestrutura Compartilhada)

**Objetivo**: Inicializar o projeto e as ferramentas básicas

- [X] T001 Criar a estrutura de pastas do projeto Next.js conforme `plan.md` (`app/`, `components/`, `lib/`, `supabase/`, `tests/`)
- [X] T002 Inicializar o projeto com Next.js 15 (App Router), TypeScript, Tailwind CSS e shadcn/ui
- [X] T003 [P] Configurar as variáveis de ambiente do Supabase e do Mercado Pago em `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`) — feito via `.env.example` (preencher `.env.local` com valores reais)
- [X] T004 [P] Configurar ESLint e Prettier no projeto — ESLint configurado (via create-next-app); Prettier ainda não adicionado
- [ ] T005 [P] Configurar Vitest (testes unitários) e Playwright (testes ponta a ponta) conforme `plan.md`

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Objetivo**: Infraestrutura central que TODAS as histórias de usuário dependem

**⚠️ CRÍTICO**: nenhuma história de usuário pode começar antes desta fase estar completa

- [X] T006 Criar migração em `supabase/migrations/` com as tabelas `cliente`, `item_cardapio`, `pedido`, `item_pedido`, conforme campos e tipos definidos em `data-model.md` (inclui a checagem `ItemPedido.quantidade > 0` e o enum de categoria `hamburguer`/`bebida`/`lanche`/`salada`)
- [X] T007 Criar migração em `supabase/migrations/` com as tabelas `pagamento`, `rota_entrega`, `parada_entrega`, `entregador`, `usuario`, `avaliacao`, conforme `data-model.md` (inclui a restrição de `Avaliacao` só existir quando `Pedido.status` é `entregue` ou `retirado`)
- [X] T008 [P] Implementar cliente e helpers de acesso ao Supabase em `lib/supabase/client.ts` e `lib/supabase/server.ts`
- [~] T009 [P] Configurar Supabase Auth com os papéis `cliente`, `gerente`, `atendente`, `entregador`, incluindo proteção de rotas por papel em `proxy.ts` — login e proteção de `/admin` e `/entregador` implementados; falta restringir por papel específico (hoje qualquer usuário autenticado acessa tudo)
- [X] T010 [P] Criar os tokens de tema centralizados (paleta de cores provisória) em `lib/theme/tokens.ts`, conforme Princípio III da constituição (nada de cor "grudada" nos componentes)
- [X] T011 Configurar tratamento de erros e mensagens amigáveis padrão (em português simples) em `lib/errors.ts`, conforme Princípio II da constituição (usabilidade autoexplicativa)

**Checkpoint**: fundação pronta — as histórias de usuário abaixo já podem ser construídas

---

## Fase 3: História 1 - Cliente faz o pedido pelo cardápio (Prioridade: P1) 🎯 MVP

**Objetivo**: cliente navega pelo cardápio, monta um pedido e o envia

**Teste Independente**: acessar o cardápio, adicionar itens de cada categoria ao carrinho, confirmar o pedido e verificar que ele é criado com número, itens e valor total corretos

### Implementação da História 1

- [X] T012 [P] [US1] Implementar endpoint `GET /api/menu` em `app/api/menu/route.ts`, listando itens com `disponivel = true` agrupados por categoria
- [X] T013 [P] [US1] Implementar página do cardápio em `app/cardapio/page.tsx`, exibindo nome, descrição e preço de cada item por categoria (FR-001)
- [X] T014 [US1] Implementar componente de carrinho de compras em `lib/cart/CartContext.tsx` + `components/carrinho/BarraCarrinho.tsx`, permitindo adicionar/remover itens e ajustar quantidade
- [X] T015 [US1] Implementar endpoint `POST /api/orders` em `app/api/orders/route.ts`: calcula `valor_total` no servidor a partir dos itens (nunca aceita valor informado pelo cliente), exige `endereco_entrega` quando `tipo_entrega = entrega` (FR-004), e retorna erro 400 se algum item estiver indisponível ou com quantidade inválida
- [X] T016 [US1] Implementar tela de confirmação do pedido em `app/pedido/[id]/page.tsx`, exibindo número do pedido, itens, valor total e status `recebido`
- [X] T017 [US1] Implementar seleção entre "retirar no local" e "entregar no endereço" no formulário de pedido (FR-004)

**Checkpoint**: a História 1 já funciona e pode ser testada de forma independente

---

## Fase 4: História 2 - Cliente paga pelo pedido (Prioridade: P1)

**Objetivo**: cliente escolhe a forma de pagamento e o pedido é confirmado como pago (ou a pagar na entrega)

**Teste Independente**: pegar um pedido criado na História 1, processar o pagamento por pix/cartão/dinheiro na entrega e conferir a mudança de status

### Implementação da História 2

- [X] T018 [P] [US2] Implementar endpoint `POST /api/payments/checkout` em `app/api/payments/checkout/route.ts`, iniciando pagamento via Mercado Pago (pix gera QR code/copia-e-cola, cartão gera link de checkout) ou marcando `a_pagar_na_entrega` (FR-005)
- [X] T019 [P] [US2] Implementar endpoint `POST /api/payments/webhook` em `app/api/payments/webhook/route.ts`, atualizando `Pagamento.status` para `pago`, `recusado` ou `estornado` conforme notificação do Mercado Pago (FR-006)
- [X] T020 [US2] Implementar tela de pagamento em `app/pedido/[id]/pagamento/page.tsx`, com as opções pix, cartão e dinheiro na entrega
- [X] T021 [US2] Conectar a tela do pedido (`components/pedido/StatusPedido.tsx`) ao Supabase Realtime para atualizar o status do pagamento automaticamente quando o webhook confirmar (depende de T016, T019)
- [X] T022 [US2] Implementar aviso de pagamento recusado com opção de tentar outra forma de pagamento

**Checkpoint**: Histórias 1 e 2 funcionam juntas (cliente pede e paga)

---

## Fase 5: História 3 - Lanchonete acompanha os recebimentos financeiros (Prioridade: P2)

**Objetivo**: gerente consulta os pagamentos recebidos e pendentes em um período

**Teste Independente**: abrir o relatório de recebimentos de um dia com pedidos pagos e pendentes e conferir se os valores/status batem

### Implementação da História 3

- [X] T023 [P] [US3] Implementar endpoint `GET /api/payments/report` em `app/api/payments/report/route.ts`, agregando total recebido por forma de pagamento e listando pagamentos do período (FR-007)
- [X] T024 [US3] Implementar página `app/admin/recebimentos/page.tsx`, exibindo o relatório com valores, formas de pagamento e status (depende de T023)

**Checkpoint**: gerente já consegue acompanhar os recebimentos

---

## Fase 6: História 4 - Lanchonete organiza rotas de entrega (Prioridade: P2)

**Objetivo**: agrupar pedidos de entrega em rotas atribuídas a um entregador e acompanhar o status de cada parada

**Teste Independente**: criar pedidos de entrega já pagos, agrupá-los em uma rota, atribuir um entregador e marcar uma parada como entregue

### Implementação da História 4

- [X] T025 [P] [US4] Implementar endpoint `POST /api/delivery-routes` em `app/api/delivery-routes/route.ts`, agrupando pedidos e atribuindo um entregador (FR-008)
- [X] T026 [P] [US4] Implementar endpoint `PATCH /api/delivery-routes/{id}/stops/{stopId}` em `app/api/delivery-routes/[id]/stops/[stopId]/route.ts`, atualizando o status da parada e, em cascata, o status do pedido (FR-009)
- [X] T027 [US4] Implementar página `app/admin/rotas/page.tsx` para o gerente montar rotas e escolher o entregador responsável (depende de T025)
- [X] T028 [US4] Implementar tela do entregador em `app/entregador/rotas/[rotaId]/page.tsx` para marcar cada parada como `entregue` ou `nao_entregue` (depende de T026)
- [X] T029 [US4] Implementar aviso ao cliente (link de WhatsApp pré-formatado) quando o pedido mudar para `saiu_para_entrega` ou `entregue` (FR-010, decisão registrada em `research.md`)

**Checkpoint**: entregas já podem ser organizadas e acompanhadas

---

## Fase 7: História 5 - Cliente avalia o atendimento (Prioridade: P3)

**Objetivo**: cliente avalia o atendimento após a conclusão do pedido

**Teste Independente**: com um pedido `entregue` ou `retirado`, enviar uma avaliação e conferir se ela aparece no histórico administrativo

### Implementação da História 5

- [X] T030 [P] [US5] Implementar endpoint `POST /api/orders/{id}/reviews` em `app/api/orders/[id]/reviews/route.ts`, aceitando nota de 1 a 5 e comentário opcional, retornando erro 409 se o pedido não estiver `entregue`/`retirado` (FR-011)
- [X] T031 [P] [US5] Implementar endpoint `GET /api/reviews` em `app/api/reviews/route.ts`
- [X] T032 [US5] Implementar tela de avaliação em `app/pedido/[id]/avaliacao/page.tsx`, disponível somente quando o pedido está concluído
- [X] T033 [US5] Implementar página `app/admin/avaliacoes/page.tsx` com o histórico de avaliações (depende de T031)

**Checkpoint**: todas as 5 histórias do spec já funcionam de ponta a ponta

---

## Fase 8: História 6 - Equipe cadastra o cardápio e configura as cores (Prioridade: P2, suporte a FR-013/FR-014)

**Objetivo**: a equipe da lanchonete consegue cadastrar os itens reais do cardápio e aplicar a paleta de cores oficial assim que forem fornecidos, sem alterar código

**Teste Independente**: cadastrar um novo item do cardápio e uma cor pelo painel administrativo e conferir que aparecem corretamente na área do cliente

### Implementação da História 6

- [X] T034 [P] [US6] Implementar endpoints `POST /api/menu`, `PATCH /api/menu/{id}` e `DELETE /api/menu/{id}` em `app/api/menu/route.ts` e `app/api/menu/[id]/route.ts` (FR-013)
- [ ] T035 [P] [US6] Implementar upload de fotos dos itens do cardápio via Supabase Storage em `lib/supabase/storage.ts`
- [X] T036 [US6] Implementar página `app/admin/cardapio/page.tsx` para cadastrar, editar e definir preço/disponibilidade dos itens do cardápio (depende de T034; upload de foto ainda pendente de T035)
- [X] T037 [US6] Implementar página `app/admin/configuracoes/page.tsx` para editar a paleta de cores — implementado com uma tabela `configuracao_tema` no banco (migração 0003) em vez de editar `lib/theme/tokens.ts` diretamente, para permitir troca sem novo deploy (FR-014, depende de T010)

**Checkpoint**: a lanchonete já pode substituir o cardápio de exemplo e a paleta provisória pelos definitivos, sem tocar em código

---

## Fase Final: Polimento e Preocupações Transversais

**Objetivo**: melhorias que afetam todas as histórias

- [ ] T038 [P] Revisar mensagens de erro e estados vazios em todas as telas do cliente e do admin, garantindo linguagem simples e direta (Princípio II) — base em `lib/errors.ts` já em português simples; falta revisão fina de cada tela
- [ ] T039 [P] Escrever testes ponta a ponta (Playwright) cobrindo as 5 histórias principais do spec em `tests/e2e/`
- [ ] T040 Rodar manualmente a validação descrita em `quickstart.md` e corrigir qualquer divergência encontrada — pendente até haver um projeto Supabase e uma conta Mercado Pago reais configurados
- [ ] T041 [P] Revisar a responsividade em telas de celular de todas as páginas (clientes acessam majoritariamente pelo celular)
- [X] T042 Documentar as variáveis de ambiente necessárias em `README.md`

---

## Dependências e Ordem de Execução

### Dependências entre Fases

- **Preparação (Fase 1)**: sem dependências — pode começar imediatamente
- **Fundação (Fase 2)**: depende da Fase 1 — BLOQUEIA todas as histórias de usuário
- **Histórias de Usuário (Fase 3 em diante)**: todas dependem da Fundação (Fase 2)
  - Podem ser feitas em paralelo (se houver mais de uma pessoa) ou em ordem de prioridade (P1 → P2 → P3)
- **Polimento (Fase Final)**: depende de todas as histórias desejadas estarem concluídas

### Dependências entre Histórias

- **História 1 (P1)**: pode começar após a Fundação — não depende de outras histórias
- **História 2 (P1)**: pode começar após a Fundação — integra com a tela de pedido da História 1 (T016), mas o processamento de pagamento em si é independente
- **História 3 (P2)**: depende de pedidos e pagamentos existirem (Histórias 1 e 2) para ter dados a exibir
- **História 4 (P2)**: depende de pedidos pagos existirem (Histórias 1 e 2)
- **História 5 (P3)**: depende de um pedido poder chegar a `entregue`/`retirado` (Histórias 1, 2 e, se for entrega, 4)
- **História 6 (P2, suporte)**: independente das demais — pode ser construída em paralelo a qualquer momento após a Fundação; sem ela, as Histórias 1-5 usam dados de exemplo (seed) no lugar do cardápio/paleta reais

### Oportunidades de Paralelismo

- Todas as tarefas [P] da Fase 1 podem ser feitas em paralelo
- Todas as tarefas [P] da Fase 2 podem ser feitas em paralelo (dentro da Fase 2)
- Depois da Fundação pronta, as Histórias 1, 2 e 6 podem começar em paralelo; Histórias 3, 4 e 5 dependem de dados gerados pelas anteriores para serem testadas de ponta a ponta (ainda que o código possa ser escrito em paralelo)

---

## Exemplo de Paralelismo: História 1

```bash
# Tarefas que podem ser feitas ao mesmo tempo na História 1:
Task: "Implementar endpoint GET /api/menu em app/api/menu/route.ts"
Task: "Implementar página do cardápio em app/(cliente)/cardapio/page.tsx"
```

---

## Estratégia de Implementação

### MVP Primeiro (Histórias 1 e 2)

1. Completar Fase 1: Preparação
2. Completar Fase 2: Fundação (CRÍTICO — bloqueia todas as histórias)
3. Completar Fase 3: História 1 (cliente monta e envia pedido)
4. Completar Fase 4: História 2 (cliente paga)
5. **PARAR e VALIDAR**: um cliente consegue pedir e pagar de ponta a ponta — isso já é um MVP demonstrável
6. Colocar no ar / demonstrar se estiver pronto

### Entrega Incremental

1. Preparação + Fundação → base pronta
2. História 1 + História 2 → cliente pede e paga (MVP!)
3. História 6 → cardápio real e cores oficiais substituem os dados de exemplo
4. História 3 → gerente acompanha recebimentos
5. História 4 → entregas organizadas em rotas
6. História 5 → avaliação do atendimento
7. Cada história agrega valor sem quebrar as anteriores

---

## Notas

- Tarefas [P] = arquivos diferentes, sem dependência entre si
- O rótulo [História] liga cada tarefa à história correspondente, para rastreabilidade
- Cada história deve poder ser concluída e testada de forma independente
- Faça commit após cada tarefa ou grupo lógico de tarefas
- Pare em qualquer checkpoint acima para validar aquela história antes de seguir adiante
