import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

/** GET /api/reviews — histórico de avaliações recebidas (uso interno/admin). */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("avaliacao")
    .select("id, pedido_id, nota, comentario, criado_em")
    .order("criado_em", { ascending: false });

  if (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }

  return NextResponse.json({ avaliacoes: data });
}
