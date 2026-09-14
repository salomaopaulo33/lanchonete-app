# Guia de Validação Rápida: Gestão de Pedidos da Lanchonete

Este guia mostra como rodar o projeto localmente e confirmar, na prática, que cada história de usuário do `spec.md` funciona de ponta a ponta.

## Pré-requisitos

- Node.js 20+
- Uma conta e um projeto criados no [Supabase](https://supabase.com)
- Uma conta de testes (sandbox) no [Mercado Pago](https://www.mercadopago.com.br/developers)
- Variáveis de ambiente em `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  MERCADOPAGO_ACCESS_TOKEN=...
  ```

## Preparar o ambiente

```bash
npm install
npx supabase db push          # aplica as tabelas descritas em data-model.md
npm run dev                   # inicia o site em http://localhost:3000
```

## Validando cada história de usuário

### História 1 — Cliente faz o pedido pelo cardápio
1. Acesse `http://localhost:3000` (área do cliente).
2. Escolha itens de cada categoria (hambúrguer, bebida, lanche, salada) e adicione ao carrinho.
3. Confirme o pedido.
4. **Esperado**: o pedido aparece com um número, status `recebido`, e o valor total bate com a soma dos itens.

### História 2 — Cliente paga pelo pedido
1. No pedido criado acima, escolha a forma de pagamento (pix, cartão ou dinheiro na entrega).
2. Para pix/cartão, use as credenciais de sandbox do Mercado Pago para simular o pagamento.
3. **Esperado**: o status do pagamento muda para `pago` (ou `a_pagar_na_entrega`) em poucos segundos, refletido automaticamente na tela (via Supabase Realtime).

### História 3 — Lanchonete acompanha os recebimentos
1. Acesse a área administrativa (`/admin/recebimentos`).
2. Consulte o relatório do dia.
3. **Esperado**: os pagamentos feitos nos testes acima aparecem na lista, com valor e forma de pagamento corretos.

### História 4 — Lanchonete organiza rotas de entrega
1. Crie 2-3 pedidos com `tipo_entrega = entrega` e pague-os.
2. Na área administrativa (`/admin/rotas`), agrupe esses pedidos em uma rota e atribua um entregador de teste.
3. Marque uma parada como `entregue`.
4. **Esperado**: o status do pedido correspondente muda para `entregue` automaticamente.

### História 5 — Cliente avalia o atendimento
1. Em um pedido com status `entregue` (ou `retirado`), acesse a opção de avaliação.
2. Envie uma nota de 1 a 5 e um comentário.
3. **Esperado**: a avaliação aparece no histórico de avaliações da área administrativa (`/admin/avaliacoes`), vinculada ao pedido correto.

## Referências

- Endpoints usados nos passos acima: ver `contracts/api.md`
- Estrutura das tabelas: ver `data-model.md`
- Decisões técnicas (gateway de pagamento, tempo real, notificações): ver `research.md`
