# Pesquisa Técnica: Gestão de Pedidos da Lanchonete

## 1. Gateway de pagamento com suporte a Pix

**Decisão**: Usar o **Mercado Pago** (Checkout API / Pix) como gateway de pagamento.

**Motivo**: É um dos gateways mais usados no Brasil, com suporte nativo e maduro a Pix, cartão de crédito/débito, boa documentação e webhooks confiáveis para confirmar pagamento em tempo quase real — essencial para o Critério de Sucesso SC-002 (confirmação em até 30s).

**Alternativas consideradas**:
- **Stripe**: excelente documentação e integração com Next.js, mas suporte a Pix no Brasil é limitado/indireto.
- **Asaas**: bom suporte a Pix e boleto, focado em pequenas empresas, mas ecossistema de documentação e exemplos menor.
- **Pagar.me**: robusto, mas com processo de homologação mais voltado a médias/grandes empresas.

## 2. Atualização de status do pedido em tempo real

**Decisão**: Usar o **Supabase Realtime** (assinatura de mudanças na tabela `pedidos`) para atualizar a tela do cliente e do painel administrativo automaticamente quando o status do pedido mudar.

**Motivo**: Já faz parte do Supabase (sem precisar de outro serviço), simples de configurar e suficiente para o volume esperado (dezenas a centenas de pedidos/dia).

**Alternativas consideradas**:
- **Polling** (a tela pergunta "mudou algo?" de tempos em tempos): mais simples, mas gera atraso e mais chamadas desnecessárias.
- **WebSocket próprio**: mais controle, porém exige manter um servidor extra — complexidade desnecessária para o tamanho do projeto.

## 3. Organização das rotas de entrega

**Decisão**: Na primeira versão, o gerente monta a rota manualmente, agrupando pedidos por região/bairro e atribuindo um entregador; o sistema apenas guarda a ordem definida e o status de cada parada.

**Motivo**: Atende à História 4 do spec sem exigir integração com serviços externos de otimização de rota, mantendo a primeira versão simples e rápida de construir.

**Alternativas consideradas**:
- **Otimização automática de rota** (ex.: API de rotas do Google Maps): melhora a eficiência das entregas, mas adiciona custo e complexidade — fica marcado como possível melhoria futura, fora do escopo desta versão.

## 4. Notificação do cliente sobre o status do pedido

**Decisão**: Notificar o cliente dentro do próprio sistema (tela do pedido atualizada em tempo real) e, complementarmente, enviar um link/mensagem de WhatsApp com o status (usando um link `wa.me` pré-formatado na primeira versão).

**Motivo**: WhatsApp é o canal mais usado por clientes de lanchonete no Brasil; começar com um link simples evita o custo e a complexidade de contratar uma API oficial do WhatsApp Business logo na primeira versão.

**Alternativas consideradas**:
- **SMS**: tem custo por mensagem e é menos usado hoje em dia para esse tipo de aviso.
- **Notificação push (app nativo)**: exigiria construir um aplicativo nativo, fora do escopo (o spec assume acesso via navegador).
- **API oficial do WhatsApp Business**: melhor experiência, porém mais cara e burocrática — fica como melhoria futura.

## 5. Autenticação de clientes e da equipe da lanchonete

**Decisão**: Usar o **Supabase Auth**: clientes fazem login simples por e-mail/celular; a equipe (gerente, atendente, entregador) tem contas com papéis (roles) diferentes, controlando o que cada um pode ver e fazer.

**Motivo**: Já integrado ao banco de dados escolhido (Supabase), evita construir um sistema de autenticação do zero, e suporta controle de acesso por papel (necessário para separar a área do cliente da área administrativa).

**Alternativas consideradas**:
- **Autenticação customizada**: mais trabalho de desenvolvimento e de segurança sem nenhum benefício adicional para este projeto.

---

Todas as pendências técnicas ("NEEDS CLARIFICATION") do Contexto Técnico do `plan.md` foram resolvidas acima.
