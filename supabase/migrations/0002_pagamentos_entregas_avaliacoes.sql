-- Migração 0002: Pagamento, Rota de Entrega, Entregador, Usuário e Avaliação
-- Ver specs/001-gestao-pedidos-lanchonete/data-model.md

create type forma_pagamento as enum ('pix', 'cartao', 'dinheiro_na_entrega');
create type status_pagamento as enum ('pendente', 'pago', 'a_pagar_na_entrega', 'estornado', 'recusado');

create table if not exists pagamento (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null unique references pedido(id) on delete cascade,
  forma_pagamento forma_pagamento not null,
  status status_pagamento not null default 'pendente',
  valor numeric(10, 2) not null,
  id_transacao_gateway text,
  pago_em timestamptz
);

create table if not exists entregador (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  ativo boolean not null default true
);

create type status_rota as enum ('planejada', 'em_andamento', 'concluida');

create table if not exists rota_entrega (
  id uuid primary key default gen_random_uuid(),
  entregador_id uuid not null references entregador(id),
  status status_rota not null default 'planejada',
  criada_em timestamptz not null default now()
);

create type status_parada as enum ('pendente', 'entregue', 'nao_entregue');

create table if not exists parada_entrega (
  id uuid primary key default gen_random_uuid(),
  rota_id uuid not null references rota_entrega(id) on delete cascade,
  pedido_id uuid not null unique references pedido(id),
  ordem integer not null,
  status status_parada not null default 'pendente'
);

create type papel_usuario as enum ('gerente', 'atendente', 'entregador');

create table if not exists usuario (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  papel papel_usuario not null
);

create table if not exists avaliacao (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null unique references pedido(id),
  nota integer not null check (nota between 1 and 5),
  comentario text,
  criado_em timestamptz not null default now()
);

-- Regra FR-011: só pode existir avaliação quando o pedido está entregue/retirado.
create or replace function checar_pedido_concluido_para_avaliacao()
returns trigger as $$
begin
  if not exists (
    select 1 from pedido
    where id = new.pedido_id
      and status in ('entregue', 'retirado', 'avaliado')
  ) then
    raise exception 'Pedido % ainda não foi entregue ou retirado', new.pedido_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_checar_pedido_concluido
  before insert on avaliacao
  for each row execute function checar_pedido_concluido_para_avaliacao();

create index if not exists idx_parada_rota on parada_entrega(rota_id);
