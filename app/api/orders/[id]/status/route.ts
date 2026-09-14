import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppError, toApiErrorResponse } from "@/lib/errors";
import { transicaoEhValida, type StatusPedido } from "@/lib/domain/pedido";

interface Params {
  params: Promise<{ id: string }>;
}

/** PATCH /api/orders/{id}/status — atualiza o status do pedido (uso interno — FR-009). */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { status: novoStatus }: { status: StatusPedido } = await request.json();

  try {
    const { data: pedido, error: erroBusca } = await supabase
      .from("pedido")
      .select("status")
      .eq("id", id)
      .single();
    if (erroBusca) throw erroBusca;

    if (!transicaoEhValida(pedido.status, novoStatus)) {
      throw new AppError(
        `Não é possível mudar o pedido de "${pedido.status}" para "${novoStatus}".`,
        409,
      );
    }

    if ((novoStatus === "entregue" || novoStatus === "retirado")) {
      const { data: pagamento } = await supabase
        .from("pagamento")
        .select("status")
        .eq("pedido_id", id)
        .single();
      if (pagamento && (pagamento.status === "pendente" || pagamento.status === "recusado")) {
        throw new AppError("O pagamento deste pedido ainda não foi confirmado.", 409);
      }
    }

    const { data: pedidoAtualizado, error } = await supabase
      .from("pedido")
      .update({ status: novoStatus, atualizado_em: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ pedido: pedidoAtualizado });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
