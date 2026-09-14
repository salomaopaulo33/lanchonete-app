-- Migração 0004: Regras de acesso (Row Level Security)
-- Sem essas regras, o Supabase bloqueia todo acesso às tabelas por padrão.
--
-- Tabelas públicas (cardápio, tema): qualquer visitante pode ler.
-- Tabelas do fluxo de pedido (cliente, pedido, item_pedido, pagamento, avaliacao):
--   o cliente não faz login nesta versão, então o acesso é liberado para
--   criar/ler pelo próprio fluxo do site (sem exigir sessão).
-- Tabelas internas (rota_entrega, parada_entrega, entregador, usuario) e as
--   escritas no cardápio/tema: exigem login da equipe (feito via Supabase Auth
--   e protegido pelas rotas /admin e /entregador em proxy.ts).

alter table item_cardapio enable row level security;
alter table configuracao_tema enable row level security;
alter table cliente enable row level security;
alter table pedido enable row level security;
alter table item_pedido enable row level security;
alter table pagamento enable row level security;
alter table avaliacao enable row level security;
alter table rota_entrega enable row level security;
alter table parada_entrega enable row level security;
alter table entregador enable row level security;
alter table usuario enable row level security;

-- Cardápio: leitura pública, escrita só para equipe logada.
create policy "cardapio_leitura_publica" on item_cardapio for select using (true);
create policy "cardapio_escrita_equipe" on item_cardapio for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Tema (cores): leitura pública, escrita só para equipe logada.
create policy "tema_leitura_publica" on configuracao_tema for select using (true);
create policy "tema_escrita_equipe" on configuracao_tema for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Cliente: qualquer visitante pode se identificar (criar/ler), sem login.
create policy "cliente_acesso_publico" on cliente for all using (true) with check (true);

-- Pedido e itens do pedido: criados e lidos publicamente (o cliente acessa
-- pelo link do próprio pedido, sem login); atualização de status é feita
-- pela equipe (logada) ou pelo webhook de pagamento (chave de serviço).
create policy "pedido_criar_e_ler" on pedido for select using (true);
create policy "pedido_criar" on pedido for insert with check (true);
create policy "pedido_atualizar_equipe" on pedido for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "item_pedido_acesso_publico" on item_pedido for all using (true) with check (true);

-- Pagamento: cliente inicia o pagamento sem login; confirmação (webhook) usa
-- a chave de serviço, que ignora estas regras.
create policy "pagamento_acesso_publico" on pagamento for all using (true) with check (true);

-- Avaliação: cliente envia sem login; consulta do histórico é da equipe.
create policy "avaliacao_criar" on avaliacao for insert with check (true);
create policy "avaliacao_ler_equipe" on avaliacao for select
  using (auth.role() = 'authenticated');

-- Tabelas internas: só a equipe logada acessa.
create policy "rota_entrega_equipe" on rota_entrega for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "parada_entrega_equipe" on parada_entrega for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "entregador_equipe" on entregador for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "usuario_equipe" on usuario for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
