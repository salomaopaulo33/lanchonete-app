# Contratos de API: Gestão de Pedidos da Lanchonete

Endpoints expostos pelas rotas de API do Next.js (`app/api/...`), consumidos pelo próprio frontend (áreas `(cliente)` e `(admin)`). Formato: JSON sobre HTTPS.

## Cardápio

### `GET /api/menu`
Lista os itens do cardápio disponíveis, agrupados por categoria.

**Resposta 200**:
```json
{
  "itens": [
    { "id": "uuid", "nome": "X-Burguer", "categoria": "hamburguer", "preco": 25.90, "disponivel": true }
  ]
}
```

### `POST /api/menu` *(uso interno/admin — FR-013)*
Cadastra um novo item do cardápio.

**Corpo**: `{ "nome": "X-Salada", "categoria": "hamburguer", "descricao": "...", "preco": 27.90, "foto_url": "..." }`

### `PATCH /api/menu/{id}` *(uso interno/admin — FR-013)*
Edita nome, descrição, preço, disponibilidade ou foto de um item existente.

### `DELETE /api/menu/{id}` *(uso interno/admin — FR-013)*
Remove um item do cardápio (ou marca como indisponível permanentemente).

## Pedidos

### `POST /api/orders`
Cria um novo pedido. *(História 1)*

**Corpo**:
```json
{
  "cliente_id": "uuid",
  "tipo_entrega": "entrega",
  "endereco_entrega": "Rua X, 123",
  "itens": [ { "item_cardapio_id": "uuid", "quantidade": 2 } ]
}
```
**Resposta 201**: pedido criado com `status: "recebido"` e `valor_total` calculado pelo servidor.
**Erros**: `400` se algum item estiver indisponível ou quantidade inválida.

### `GET /api/orders/{id}`
Consulta o status e os detalhes de um pedido.

### `PATCH /api/orders/{id}/status`
Atualiza o status do pedido (uso interno da lanchonete/entregador). *(Histórias 1 e 4)*

**Corpo**: `{ "status": "em_preparo" }`
**Regras**: só aceita transições válidas (ver `data-model.md`); `entregue`/`retirado` exigem que o pagamento não esteja `pendente` nem `recusado`.

## Pagamentos

### `POST /api/payments/checkout`
Inicia o pagamento de um pedido. *(História 2)*

**Corpo**: `{ "pedido_id": "uuid", "forma_pagamento": "pix" }`
**Resposta 200** (pix): `{ "qr_code": "...", "copia_e_cola": "...", "pagamento_id": "uuid" }`
**Resposta 200** (cartão): `{ "checkout_url": "..." }`
**Resposta 200** (dinheiro na entrega): pagamento marcado como `a_pagar_na_entrega` imediatamente.

### `POST /api/payments/webhook`
Recebido do Mercado Pago para confirmar pagamento. Não é chamado pelo frontend.

**Efeito**: atualiza `Pagamento.status` para `pago`, `recusado` ou `estornado` conforme notificação do gateway.

### `GET /api/payments/report?inicio=YYYY-MM-DD&fim=YYYY-MM-DD`
Relatório de recebimentos financeiros no período. *(História 3, uso interno/admin)*

**Resposta 200**:
```json
{
  "total_recebido": 1234.56,
  "por_forma_pagamento": { "pix": 800.00, "cartao": 300.00, "dinheiro_na_entrega": 134.56 },
  "pagamentos": [ { "pedido_id": "uuid", "valor": 25.90, "forma_pagamento": "pix", "status": "pago", "pago_em": "..." } ]
}
```

## Rotas de Entrega

### `POST /api/delivery-routes`
Cria uma rota agrupando pedidos de entrega e atribuindo um entregador. *(História 4, uso interno/admin)*

**Corpo**: `{ "entregador_id": "uuid", "pedidos_ids": ["uuid", "uuid"] }`

### `PATCH /api/delivery-routes/{id}/stops/{stopId}`
Atualiza o status de uma parada da rota (ex.: `entregue`, `nao_entregue`). Dispara também a atualização de `Pedido.status`.

## Avaliações

### `POST /api/orders/{id}/reviews`
Registra a avaliação do cliente sobre o atendimento. *(História 5)*

**Corpo**: `{ "nota": 5, "comentario": "Entrega rápida!" }`
**Regras**: só aceito se `Pedido.status` for `entregue` ou `retirado`; erro `409` caso contrário (ver Caso de Borda do spec).

### `GET /api/reviews?inicio=YYYY-MM-DD&fim=YYYY-MM-DD`
Lista o histórico de avaliações recebidas (uso interno/admin).
