# Lanchonete App

Sistema de gestão de pedidos para uma lanchonete: cardápio, pagamentos, recebimentos, rotas de entrega e avaliação de atendimento.

Ver a documentação completa da funcionalidade em [`specs/001-gestao-pedidos-lanchonete/`](./specs/001-gestao-pedidos-lanchonete/) (especificação, plano técnico, modelo de dados e lista de tarefas).

## Como rodar localmente

### 1. Pré-requisitos

- Node.js 20+
- Uma conta e um projeto no [Supabase](https://supabase.com)
- Uma conta de desenvolvedor no [Mercado Pago](https://www.mercadopago.com.br/developers)

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Painel do Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Painel do Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Painel do Supabase → Project Settings → API (chave secreta — nunca expor no navegador) |
| `MERCADOPAGO_ACCESS_TOKEN` | Painel de desenvolvedores do Mercado Pago → Credenciais |

### 3. Aplicar as tabelas no banco de dados

Rode os arquivos de `supabase/migrations/` no editor SQL do Supabase (ou via `npx supabase db push`, se o CLI do Supabase estiver instalado).

### 4. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` (área do cliente) e `http://localhost:3000/admin/recebimentos` (área da equipe — exige login).

## Estrutura do projeto

- `app/` — páginas e rotas de API (área do cliente na raiz, área da equipe em `/admin`, entregador em `/entregador`)
- `components/` — componentes de interface
- `lib/` — regras de negócio, acesso ao Supabase, integração de pagamento
- `supabase/migrations/` — esquema do banco de dados

## Validação passo a passo

Ver [`specs/001-gestao-pedidos-lanchonete/quickstart.md`](./specs/001-gestao-pedidos-lanchonete/quickstart.md) para o roteiro de testes manuais de cada funcionalidade.
