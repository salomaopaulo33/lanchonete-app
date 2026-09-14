# Modelo de Dados: Gestão de Pedidos da Lanchonete

## Cliente
Representa a pessoa que faz pedidos.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| nome | texto | obrigatório |
| telefone | texto | usado para contato/WhatsApp |
| email | texto | usado para login (Supabase Auth) |
| endereco_padrao | texto | opcional, pode ter vários endereços |
| criado_em | data/hora | |

## ItemCardapio
Produto vendido pela lanchonete.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| nome | texto | obrigatório |
| categoria | enum | `hamburguer`, `bebida`, `lanche`, `salada` |
| descricao | texto | opcional |
| preco | numérico | obrigatório, > 0 |
| disponivel | booleano | controla se aparece no cardápio (estoque) |
| foto_url | texto | opcional (Supabase Storage) |

## Pedido
Conjunto de itens escolhidos por um cliente em uma compra.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| cliente_id | uuid | referência a Cliente |
| tipo_entrega | enum | `retirada` ou `entrega` |
| endereco_entrega | texto | obrigatório se `tipo_entrega = entrega` |
| status | enum | ver "Transições de Status" abaixo |
| valor_total | numérico | calculado a partir dos itens + taxa de entrega |
| taxa_entrega | numérico | 0 se `tipo_entrega = retirada` |
| criado_em | data/hora | |
| atualizado_em | data/hora | |

### ItemPedido
Item específico dentro de um pedido (tabela de associação Pedido ↔ ItemCardapio).

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| pedido_id | uuid | referência a Pedido |
| item_cardapio_id | uuid | referência a ItemCardapio |
| quantidade | inteiro | > 0 |
| preco_unitario | numérico | preço no momento do pedido (histórico) |

### Transições de Status do Pedido

```
recebido → em_preparo → pronto → saiu_para_entrega* → entregue → avaliado
                              └→ retirado (quando tipo_entrega = retirada)
                    (em qualquer ponto antes de "entregue"/"retirado") → cancelado
```
`*` só se aplica quando `tipo_entrega = entrega`.

## Pagamento
Registro do pagamento de um pedido.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| pedido_id | uuid | referência a Pedido (1:1) |
| forma_pagamento | enum | `pix`, `cartao`, `dinheiro_na_entrega` |
| status | enum | `pendente`, `pago`, `a_pagar_na_entrega`, `estornado`, `recusado` |
| valor | numérico | igual ao `valor_total` do pedido |
| id_transacao_gateway | texto | id retornado pelo Mercado Pago (quando aplicável) |
| pago_em | data/hora | opcional |

## RotaEntrega
Agrupamento de pedidos de entrega atribuídos a um entregador.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| entregador_id | uuid | referência a Entregador |
| status | enum | `planejada`, `em_andamento`, `concluida` |
| criada_em | data/hora | |

### ParadaEntrega
Uma parada (um pedido) dentro de uma rota, em uma ordem definida.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| rota_id | uuid | referência a RotaEntrega |
| pedido_id | uuid | referência a Pedido |
| ordem | inteiro | posição na sequência de entregas |
| status | enum | `pendente`, `entregue`, `nao_entregue` |

## Entregador
Pessoa responsável por uma ou mais rotas de entrega.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| nome | texto | |
| telefone | texto | |
| ativo | booleano | |

## Usuario (equipe da lanchonete)
Conta de acesso ao painel administrativo.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária (vinculado ao Supabase Auth) |
| nome | texto | |
| papel | enum | `gerente`, `atendente`, `entregador` |

## Avaliacao
Feedback do cliente sobre um pedido concluído.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | chave primária |
| pedido_id | uuid | referência a Pedido (1:1), só pode existir se status do pedido for `entregue` ou `retirado` |
| nota | inteiro | de 1 a 5 |
| comentario | texto | opcional |
| criado_em | data/hora | |

## Relacionamentos

- Cliente 1:N Pedido
- Pedido 1:N ItemPedido; ItemPedido N:1 ItemCardapio
- Pedido 1:1 Pagamento
- Pedido 1:1 Avaliacao (somente após conclusão)
- RotaEntrega 1:N ParadaEntrega; ParadaEntrega 1:1 Pedido
- Entregador 1:N RotaEntrega

## Regras de Validação (derivadas dos requisitos)

- FR-002/FR-003: `ItemPedido.quantidade > 0`; `Pedido.valor_total` é sempre recalculado a partir dos itens + taxa de entrega, nunca informado livremente pelo cliente.
- FR-004: `Pedido.endereco_entrega` é obrigatório quando `tipo_entrega = entrega`.
- FR-006: `Pagamento.status` só pode ser `pago` após confirmação do gateway (webhook) ou, no caso de `dinheiro_na_entrega`, após o entregador confirmar o recebimento.
- FR-011: `Avaliacao` só pode ser criada quando `Pedido.status` é `entregue` ou `retirado` (ver Caso de Borda do spec).
