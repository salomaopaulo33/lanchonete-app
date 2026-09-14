# Especificação da Funcionalidade: Gestão de Pedidos da Lanchonete

**Branch da Funcionalidade**: `001-gestao-pedidos-lanchonete`

**Criado em**: 2026-09-12

**Status**: Rascunho

**Entrada do usuário**: "Sistema de gestão para uma lanchonete que vende hambúrgueres, bebidas, lanches e saladas. O sistema precisa: receber pedidos dos clientes (cardápio com hambúrgueres, bebidas, lanches e saladas); processar pagamentos dos pedidos; controlar recebimentos financeiros; gerenciar rotas de entrega para os pedidos que saem para entrega; e permitir que o cliente avalie o atendimento recebido."

## Cenários de Uso e Testes *(obrigatório)*

### História 1 - Cliente faz o pedido pelo cardápio (Prioridade: P1)

O cliente acessa o cardápio digital da lanchonete, escolhe itens entre hambúrgueres, bebidas, lanches e saladas, monta seu pedido e o envia.

**Por que essa prioridade**: sem essa funcionalidade não existe negócio — é a base de tudo. É o primeiro passo do cliente e o ponto de entrada de toda a operação.

**Teste independente**: pode ser testado sozinho fazendo um cliente navegar pelo cardápio, montar um pedido e enviá-lo, sem depender de pagamento ou entrega já estarem prontos.

**Cenários de Aceitação**:

1. **Dado** que o cliente está vendo o cardápio, **Quando** ele escolhe itens de hambúrgueres, bebidas, lanches ou saladas e define as quantidades, **Então** o pedido é montado com os itens corretos e o valor total é calculado automaticamente.
2. **Dado** que o cliente terminou de montar o pedido, **Quando** ele confirma o envio, **Então** o sistema gera um número de pedido e avisa a lanchonete que um novo pedido chegou.

---

### História 2 - Cliente paga pelo pedido (Prioridade: P1)

Depois de montar o pedido, o cliente escolhe uma forma de pagamento e conclui o pagamento.

**Por que essa prioridade**: sem pagamento confirmado (ou garantido para pagar na entrega), a lanchonete não pode processar o pedido com segurança.

**Teste independente**: pode ser testado pegando um pedido já criado e processando o pagamento dele, verificando se o status muda corretamente.

**Cenários de Aceitação**:

1. **Dado** um pedido aguardando pagamento, **Quando** o cliente escolhe pix, cartão ou "pagar na entrega" e confirma, **Então** o pedido é marcado como "pago" ou "a pagar na entrega".
2. **Dado** que um pagamento online foi recusado, **Quando** o sistema tenta processá-lo, **Então** o cliente é avisado do problema e pode tentar outra forma de pagamento.

---

### História 3 - Lanchonete acompanha os recebimentos financeiros (Prioridade: P2)

O dono ou gerente da lanchonete consulta quanto dinheiro entrou, quais pedidos foram pagos e quais ainda estão pendentes.

**Por que essa prioridade**: é essencial para o controle financeiro do negócio, mas depende dos pedidos e pagamentos já existirem (Histórias 1 e 2).

**Teste independente**: pode ser testado abrindo o relatório de recebimentos de um período e conferindo se os valores e status batem com os pagamentos registrados.

**Cenários de Aceitação**:

1. **Dado** que existem pedidos pagos no dia, **Quando** o gerente abre o relatório de recebimentos, **Então** ele vê a lista de pagamentos com valores, formas de pagamento e status.
2. **Dado** que existe um pedido com pagamento pendente, **Quando** o gerente consulta os recebimentos, **Então** esse pedido aparece como pendente até ser quitado.

---

### História 4 - Lanchonete organiza as rotas de entrega (Prioridade: P2)

Os pedidos marcados para entrega são agrupados em rotas e atribuídos a um entregador, que atualiza o status conforme entrega cada pedido.

**Por que essa prioridade**: importante para pedidos com entrega, mas só faz sentido depois que existem pedidos pagos para entregar.

**Teste independente**: pode ser testado agrupando pedidos de entrega em uma rota e acompanhando a mudança de status até "entregue".

**Cenários de Aceitação**:

1. **Dado** vários pedidos marcados para entrega, **Quando** a rota é organizada, **Então** os pedidos ficam agrupados em uma sequência lógica, com endereço e entregador responsável definidos.
2. **Dado** que o entregador está em rota, **Quando** ele marca um pedido como "entregue", **Então** o status desse pedido é atualizado e o cliente é avisado.

---

### História 5 - Cliente avalia o atendimento (Prioridade: P3)

Depois que o pedido é concluído (entregue ou retirado), o cliente pode dar uma nota e comentar sobre o atendimento recebido.

**Por que essa prioridade**: melhora a qualidade do serviço ao longo do tempo, mas não impede a operação básica da lanchonete funcionar sem essa funcionalidade no início.

**Teste independente**: pode ser testado permitindo que um cliente com pedido concluído registre uma avaliação e conferindo se ela aparece no histórico.

**Cenários de Aceitação**:

1. **Dado** que o pedido foi entregue ou retirado, **Quando** o cliente acessa a opção de avaliação, **Então** ele pode dar uma nota (de 1 a 5) e escrever um comentário sobre o atendimento.
2. **Dado** que uma avaliação foi enviada, **Quando** o gerente consulta o histórico de avaliações, **Então** ele consegue ver a nota, o comentário e o pedido relacionado.

---

### Casos de Borda

- O que acontece se o cliente tentar pedir um item que está sem estoque?
- Como o sistema lida com um pagamento que falha depois que o pedido já foi enviado para a cozinha?
- O que acontece se não houver nenhum entregador disponível para montar uma rota?
- Como o sistema trata o estorno de um pedido cancelado que já havia sido pago?
- O que acontece se o cliente tentar avaliar um pedido que ainda não foi entregue ou retirado?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE exibir um cardápio com as categorias hambúrgueres, bebidas, lanches e saladas, mostrando nome, descrição e preço de cada item.
- **FR-002**: O sistema DEVE permitir que o cliente monte um pedido escolhendo um ou mais itens do cardápio e as quantidades desejadas.
- **FR-003**: O sistema DEVE calcular automaticamente o valor total do pedido, incluindo taxa de entrega quando aplicável.
- **FR-004**: O sistema DEVE permitir que o cliente escolha entre retirada no local ou entrega em um endereço informado.
- **FR-005**: O sistema DEVE permitir o pagamento do pedido por pix, cartão de crédito/débito ou dinheiro na entrega.
- **FR-006**: O sistema DEVE registrar o status de pagamento de cada pedido (pendente, pago, a pagar na entrega, estornado).
- **FR-007**: O sistema DEVE disponibilizar um relatório de recebimentos financeiros com os pagamentos realizados em um período, separados por forma de pagamento.
- **FR-008**: O sistema DEVE permitir agrupar pedidos marcados para entrega em rotas, associando cada rota a um entregador.
- **FR-009**: O sistema DEVE permitir atualizar o status de cada pedido em rota (ex.: preparando, saiu para entrega, entregue).
- **FR-010**: O sistema DEVE notificar o cliente quando o status do pedido mudar (ex.: confirmado, saiu para entrega, entregue).
- **FR-011**: O sistema DEVE permitir que o cliente avalie o atendimento após a conclusão do pedido, com nota e comentário opcional.
- **FR-012**: O sistema DEVE manter um histórico de pedidos, pagamentos, entregas e avaliações associado a cada cliente.
- **FR-013**: O sistema DEVE permitir que a equipe da lanchonete cadastre, edite, defina preço e disponibilidade e adicione fotos dos itens do cardápio, sem necessidade de alteração de código (os itens reais do cardápio serão fornecidos após esta especificação).
- **FR-014**: O sistema DEVE permitir a configuração das cores e identidade visual a partir de um conjunto central de opções (paleta de cores), sem necessidade de alteração de código (a paleta oficial da lanchonete será fornecida posteriormente).

### Principais Entidades

- **Cliente**: pessoa que faz pedidos; possui nome, contato, endereço(s) de entrega e histórico de pedidos.
- **Item do Cardápio**: produto vendido (hambúrguer, bebida, lanche ou salada); possui nome, categoria, descrição, preço e disponibilidade.
- **Pedido**: conjunto de itens escolhidos por um cliente; possui status, forma de entrega (retirada/entrega), valor total e vínculo com o pagamento.
- **Pagamento**: registro do pagamento de um pedido; possui forma de pagamento, valor, status e data.
- **Rota de Entrega**: agrupamento de pedidos para entrega; possui entregador responsável, sequência de paradas e status.
- **Avaliação**: feedback do cliente sobre um pedido concluído; possui nota, comentário e data.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Um cliente consegue montar e enviar um pedido completo pelo cardápio em menos de 3 minutos.
- **SC-002**: 95% dos pagamentos processados são confirmados (aprovados ou registrados) em até 30 segundos.
- **SC-003**: O gerente consegue conferir os recebimentos financeiros do dia em menos de 1 minuto.
- **SC-004**: 90% dos pedidos de entrega chegam ao cliente dentro do prazo estimado informado no momento do pedido.
- **SC-005**: Pelo menos 60% dos clientes com pedido concluído registram uma avaliação de atendimento.

## Suposições

- Cada pedido pertence a uma única lanchonete (uma loja/unidade); suporte a múltiplas filiais não faz parte da primeira versão.
- A entrega é feita por entregadores da própria lanchonete, não por um serviço terceirizado (como iFood ou Uber Eats).
- As formas de pagamento aceitas são pix, cartão de crédito/débito e dinheiro na entrega; pagamentos online passam por um serviço de pagamento (gateway) já existente no mercado.
- A avaliação de atendimento só pode ser feita depois que o pedido é marcado como concluído (entregue ou retirado).
- Clientes acessam o sistema pelo celular ou computador com internet; não é necessário um aplicativo nativo específico na primeira versão.
- Até o lançamento, o sistema é construído com um cardápio de exemplo e uma paleta de cores provisória; ambos serão substituídos pelos definitivos assim que a lanchonete os fornecer, sem necessidade de alterar o código (ver FR-013 e FR-014).
