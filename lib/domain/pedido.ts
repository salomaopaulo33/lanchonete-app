export type CategoriaItem = "hamburguer" | "bebida" | "lanche" | "salada";

export interface ItemCardapio {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  descricao: string | null;
  preco: number;
  disponivel: boolean;
  fotoUrl: string | null;
}

export interface ItemPedidoInput {
  itemCardapioId: string;
  quantidade: number;
}

export type StatusPedido =
  | "recebido"
  | "em_preparo"
  | "pronto"
  | "saiu_para_entrega"
  | "entregue"
  | "retirado"
  | "avaliado"
  | "cancelado";

/** Transições de status válidas (ver data-model.md). */
export const transicoesValidas: Record<StatusPedido, StatusPedido[]> = {
  recebido: ["em_preparo", "cancelado"],
  em_preparo: ["pronto", "cancelado"],
  pronto: ["saiu_para_entrega", "retirado", "cancelado"],
  saiu_para_entrega: ["entregue", "cancelado"],
  entregue: ["avaliado"],
  retirado: ["avaliado"],
  avaliado: [],
  cancelado: [],
};

export function transicaoEhValida(de: StatusPedido, para: StatusPedido): boolean {
  return transicoesValidas[de]?.includes(para) ?? false;
}

export function pedidoPodeSerAvaliado(status: StatusPedido): boolean {
  return status === "entregue" || status === "retirado";
}

/**
 * Calcula o valor total do pedido a partir dos itens e da taxa de entrega.
 * O valor NUNCA deve ser aceito diretamente do cliente (FR-003) — sempre
 * recalculado no servidor a partir do preço atual de cada item.
 */
export function calcularValorTotal(
  itens: { quantidade: number; precoUnitario: number }[],
  taxaEntrega: number,
): number {
  const subtotal = itens.reduce((total, item) => total + item.quantidade * item.precoUnitario, 0);
  return Math.round((subtotal + taxaEntrega) * 100) / 100;
}
