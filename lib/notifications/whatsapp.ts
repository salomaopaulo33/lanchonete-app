/**
 * Gera um link "wa.me" para avisar o cliente sobre o status do pedido
 * (decisão registrada em research.md — WhatsApp é o canal mais usado no
 * Brasil; a API oficial fica como melhoria futura).
 */
export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numeroLimpo = telefone.replace(/\D/g, "");
  return `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
}

export const mensagensStatusPedido = {
  saiu_para_entrega: (pedidoId: string) =>
    `Seu pedido #${pedidoId.slice(0, 8)} saiu para entrega! 🛵`,
  entregue: (pedidoId: string) => `Seu pedido #${pedidoId.slice(0, 8)} foi entregue. Bom apetite! 🍔`,
};
