<!--
Sync Impact Report
- Version change: (sem versão anterior / modelo em branco) → 1.0.0
- Princípios adicionados:
  - I. Objetividade e Eficiência
  - II. Usabilidade Autoexplicativa
  - III. Identidade Visual e Conteúdo Configuráveis
- Seções adicionadas: Padrão Tecnológico; Governança
- Seções removidas: nenhuma (modelo estava em branco/placeholder)
- Templates dependentes: nenhuma referência direta a princípios antigos encontrada em
  .specify/templates/*.md — não requerem atualização nesta ratificação.
- TODOs pendentes: nenhum
-->

# Lanchonete App Constitution

## Core Principles

### I. Objetividade e Eficiência

O sistema DEVE resolver apenas o que é necessário para cada fluxo do negócio (pedido, pagamento,
recebimento, entrega, avaliação), sem passos extras, telas desnecessárias ou funcionalidades que
não agreguem valor direto ao cliente ou à operação da lanchonete. Toda nova funcionalidade proposta
DEVE justificar a necessidade real que resolve antes de ser adicionada; funcionalidades
especulativas ou "bonitas de ter" sem uso comprovado DEVEM ser adiadas ou rejeitadas.

**Racional**: uma lanchonete opera com equipe pequena e tempo limitado; cada passo ou tela extra
é tempo perdido tanto para o cliente quanto para quem atende — o sistema deve servir ao negócio,
não o contrário.

### II. Usabilidade Autoexplicativa

Toda tela e fluxo DEVE poder ser usado por qualquer pessoa — cliente ou equipe da lanchonete — sem
necessidade de treinamento, manual ou explicação externa. Textos, botões, rótulos e mensagens de
erro DEVEM ser claros, diretos e em português simples. O caminho para completar qualquer tarefa
(montar um pedido, pagar, organizar uma entrega, avaliar o atendimento) DEVE ser óbvio a partir da
tela em que o usuário está, sem exigir conhecimento prévio do sistema.

**Racional**: os usuários finais (clientes e equipe operacional) não são técnicos e não terão tempo
ou disposição para aprender um sistema complicado; a clareza da interface é parte do produto, não
um detalhe visual.

### III. Identidade Visual e Conteúdo Configuráveis

Cores, tipografia e demais elementos visuais DEVEM ser definidos como tokens de tema centralizados
(não codificados diretamente dentro de componentes), permitindo aplicar a paleta de cores oficial da
lanchonete assim que ela for fornecida, sem exigir alteração de código. Da mesma forma, os itens do
cardápio (nomes, descrições, preços, categorias e fotos) DEVEM ser cadastráveis e editáveis pela
equipe da lanchonete através do próprio sistema, e não fixados diretamente no código-fonte.

**Racional**: a paleta de cores definitiva e o cardápio real ainda serão fornecidos; construir o
sistema com esses pontos como configuração/cadastro evita retrabalho técnico quando essas
informações chegarem.

## Padrão Tecnológico

O projeto usa Next.js (App Router, TypeScript) com Supabase (Postgres, Auth, Realtime, Storage)
como base técnica padrão, conforme registrado em `specs/001-gestao-pedidos-lanchonete/plan.md` e
`research.md`. Novas funcionalidades DEVEM reutilizar essa mesma base tecnológica, salvo
justificativa explícita registrada no plano da funcionalidade correspondente, para manter a
manutenção simples e consistente com os demais projetos do autor.

## Governança

Esta constituição tem precedência sobre qualquer prática, convenção ou decisão técnica que
conflite com ela. Alterações nesta constituição exigem: (1) registro do motivo da mudança, (2)
atualização do número de versão seguindo versionamento semântico (MAJOR: remoção ou redefinição
incompatível de princípio; MINOR: novo princípio ou seção; PATCH: redação/clareza), e (3)
atualização da data de "Última Emenda" abaixo.

Toda funcionalidade nova DEVE passar pela verificação da constituição ("Constitution Check") na
etapa `/speckit-plan` antes de avançar para a implementação. Complexidade adicional (novas
dependências, camadas extras, serviços externos) que aparente contrariar os Princípios I ou III
DEVE ser justificada por escrito na seção "Rastreamento de Complexidade" do plano da funcionalidade.

**Versão**: 1.0.0 | **Ratificada em**: 2026-09-12 | **Última Emenda**: 2026-09-12
