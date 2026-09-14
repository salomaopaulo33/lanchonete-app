import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

/** POST /api/delivery-routes — agrupa pedidos de entrega em uma rota (FR-008). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { entregadorId, pedidosIds }: { entregadorId: string; pedidosIds: string[] } =
    await request.json();

  try {
    const { data: rota, error: erroRota } = await supabase
      .from("rota_entrega")
      .insert({ entregador_id: entregadorId, status: "planejada" })
      .select()
      .single();
    if (erroRota) throw erroRota;

    const paradas = pedidosIds.map((pedidoId, indice) => ({
      rota_id: rota.id,
      pedido_id: pedidoId,
      ordem: indice + 1,
      status: "pendente" as const,
    }));

    const { error: erroParadas } = await supabase.from("parada_entrega").insert(paradas);
    if (erroParadas) throw erroParadas;

    await supabase
      .from("pedido")
      .update({ status: "saiu_para_entrega" })
      .in("id", pedidosIds)
      .eq("status", "pronto");

    return NextResponse.json({ rota }, { status: 201 });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
