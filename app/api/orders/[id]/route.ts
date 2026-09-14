import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mensagensErro, toApiErrorResponse, AppError } from "@/lib/errors";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/orders/{id} — consulta o status e os itens de um pedido. */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pedido, error } = await supabase
    .from("pedido")
    .select(
      "id, status, tipo_entrega, endereco_entrega, valor_total, taxa_entrega, criado_em, item_pedido(quantidade, preco_unitario, item_cardapio(nome)), pagamento(status, forma_pagamento)",
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      const { message, status } = toApiErrorResponse(new AppError(mensagensErro.pedidoNaoEncontrado, 404));
      return NextResponse.json({ erro: message }, { status });
    }
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }

  return NextResponse.json({ pedido });
}
