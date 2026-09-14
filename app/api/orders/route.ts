import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppError, mensagensErro, toApiErrorResponse } from "@/lib/errors";
import { calcularValorTotal, type ItemPedidoInput } from "@/lib/domain/pedido";

const TAXA_ENTREGA_PADRAO = 6.0;

interface CorpoNovoPedido {
  clienteId: string;
  tipoEntrega: "retirada" | "entrega";
  enderecoEntrega?: string;
  itens: ItemPedidoInput[];
}

/**
 * POST /api/orders — cria um novo pedido (FR-002, FR-003, FR-004).
 * O valor total é sempre calculado aqui a partir do preço atual de cada
 * item — nunca aceito diretamente do cliente.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const corpo: CorpoNovoPedido = await request.json();

  try {
    if (corpo.tipoEntrega === "entrega" && !corpo.enderecoEntrega?.trim()) {
      throw new AppError(mensagensErro.enderecoObrigatorio, 400);
    }
    if (!corpo.itens?.length) {
      throw new AppError(mensagensErro.quantidadeInvalida, 400);
    }
    for (const item of corpo.itens) {
      if (item.quantidade <= 0) {
        throw new AppError(mensagensErro.quantidadeInvalida, 400);
      }
    }

    const idsItens = corpo.itens.map((item) => item.itemCardapioId);
    const { data: itensCardapio, error: erroCardapio } = await supabase
      .from("item_cardapio")
      .select("id, preco, disponivel")
      .in("id", idsItens);

    if (erroCardapio) throw erroCardapio;

    const mapaItens = new Map(itensCardapio?.map((item) => [item.id, item]));
    for (const itemPedido of corpo.itens) {
      const itemCardapio = mapaItens.get(itemPedido.itemCardapioId);
      if (!itemCardapio || !itemCardapio.disponivel) {
        throw new AppError(mensagensErro.itemIndisponivel, 400);
      }
    }

    const taxaEntrega = corpo.tipoEntrega === "entrega" ? TAXA_ENTREGA_PADRAO : 0;
    const itensComPreco = corpo.itens.map((item) => ({
      ...item,
      precoUnitario: mapaItens.get(item.itemCardapioId)!.preco as number,
    }));
    const valorTotal = calcularValorTotal(
      itensComPreco.map((i) => ({ quantidade: i.quantidade, precoUnitario: i.precoUnitario })),
      taxaEntrega,
    );

    const { data: pedido, error: erroPedido } = await supabase
      .from("pedido")
      .insert({
        cliente_id: corpo.clienteId,
        tipo_entrega: corpo.tipoEntrega,
        endereco_entrega: corpo.enderecoEntrega ?? null,
        valor_total: valorTotal,
        taxa_entrega: taxaEntrega,
        status: "recebido",
      })
      .select()
      .single();

    if (erroPedido) throw erroPedido;

    const { error: erroItens } = await supabase.from("item_pedido").insert(
      itensComPreco.map((item) => ({
        pedido_id: pedido.id,
        item_cardapio_id: item.itemCardapioId,
        quantidade: item.quantidade,
        preco_unitario: item.precoUnitario,
      })),
    );

    if (erroItens) throw erroItens;

    return NextResponse.json({ pedido }, { status: 201 });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
