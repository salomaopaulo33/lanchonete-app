import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

interface Params {
  params: Promise<{ id: string; stopId: string }>;
}

/**
 * PATCH /api/delivery-routes/{id}/stops/{stopId} — atualiza o status de uma
 * parada da rota e, em cascata, o status do pedido (FR-009).
 */
export async function PATCH(request: Request, { params }: Params) {
  const { stopId } = await params;
  const supabase = await createClient();
  const { status }: { status: "entregue" | "nao_entregue" } = await request.json();

  try {
    const { data: parada, error: erroParada } = await supabase
      .from("parada_entrega")
      .update({ status })
      .eq("id", stopId)
      .select("pedido_id")
      .single();
    if (erroParada) throw erroParada;

    if (status === "entregue") {
      const { error: erroPedido } = await supabase
        .from("pedido")
        .update({ status: "entregue", atualizado_em: new Date().toISOString() })
        .eq("id", parada.pedido_id);
      if (erroPedido) throw erroPedido;
    }

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    const { message, status: codigo } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status: codigo });
  }
}
