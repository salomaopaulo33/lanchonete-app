import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppError, mensagensErro, toApiErrorResponse } from "@/lib/errors";
import { pedidoPodeSerAvaliado } from "@/lib/domain/pedido";

interface Params {
  params: Promise<{ id: string }>;
}

/** POST /api/orders/{id}/reviews — registra a avaliação do cliente (FR-011). */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { nota, comentario }: { nota: number; comentario?: string } = await request.json();

  try {
    const { data: pedido, error: erroPedido } = await supabase
      .from("pedido")
      .select("status")
      .eq("id", id)
      .single();
    if (erroPedido || !pedido) throw new AppError(mensagensErro.pedidoNaoEncontrado, 404);

    if (!pedidoPodeSerAvaliado(pedido.status)) {
      throw new AppError(mensagensErro.avaliacaoAntesDaHora, 409);
    }

    const { data: avaliacao, error } = await supabase
      .from("avaliacao")
      .insert({ pedido_id: id, nota, comentario: comentario ?? null })
      .select()
      .single();
    if (error) throw error;

    await supabase.from("pedido").update({ status: "avaliado" }).eq("id", id);

    return NextResponse.json({ avaliacao }, { status: 201 });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
