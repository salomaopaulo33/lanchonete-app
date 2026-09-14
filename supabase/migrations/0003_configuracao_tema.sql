-- Migração 0003: Configuração de tema (paleta de cores) — FR-014
-- Permite trocar a paleta de cores pelo painel administrativo, sem alterar código.

create table if not exists configuracao_tema (
  chave text primary key,
  valor text not null
);

insert into configuracao_tema (chave, valor) values
  ('primary', '#e4572e'),
  ('primary_foreground', '#ffffff'),
  ('secondary', '#2e4057'),
  ('secondary_foreground', '#ffffff'),
  ('background', '#fffbf5'),
  ('foreground', '#1f2933')
on conflict (chave) do nothing;
