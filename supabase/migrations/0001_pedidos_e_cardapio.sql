-- Migração 0001: Cliente, Item do Cardápio, Pedido e Item do Pedido
-- Ver specs/001-gestao-pedidos-lanchonete/data-model.md

create extension if not exists "pgcrypto";

create table if not exists cliente (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text unique,
  endereco_padrao text,
  criado_em timestamptz not null default now()
);

create type categoria_item as enum ('hamburguer', 'bebida', 'lanche', 'salada');

create table if not exists item_cardapio (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria categoria_item not null,
  descricao text,
  preco numeric(10, 2) not null check (preco > 0),
  disponivel boolean not null default true,
  foto_url text
);

create type tipo_entrega_pedido as enum ('retirada', 'entrega');
create type status_pedido as enum (
  'recebido', 'em_preparo', 'pronto', 'saiu_para_entrega',
  'entregue', 'retirado', 'avaliado', 'cancelado'
);

create table if not exists pedido (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references cliente(id),
  tipo_entrega tipo_entrega_pedido not null,
  endereco_entrega text,
  status status_pedido not null default 'recebido',
  valor_total numeric(10, 2) not null default 0,
  taxa_entrega numeric(10, 2) not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint endereco_obrigatorio_para_entrega check (
    tipo_entrega = 'retirada' or endereco_entrega is not null
  )
);

create table if not exists item_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedido(id) on delete cascade,
  item_cardapio_id uuid not null references item_cardapio(id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null
);

create index if not exists idx_pedido_cliente on pedido(cliente_id);
create index if not exists idx_item_pedido_pedido on item_pedido(pedido_id);
