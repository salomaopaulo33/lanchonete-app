import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

/**
 * POST /api/clientes — encontra o cliente pelo telefone ou cria um novo.
 * Suporte de infraestrutura para a História 1 (o spec não exige login para
 * o cliente fazer pedidos, apenas identificação por nome/telefone).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { nome, telefone }: { nome: string; telefone: string } = await request.json();

  try {
    const { data: existente } = await supabase
      .from("cliente")
      .select()
      .eq("telefone", telefone)
      .maybeSingle();

    if (existente) {
      return NextResponse.json({ cliente: existente });
    }

    const { data: novo, error } = await supabase
      .from("cliente")
      .insert({ nome, telefone })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ cliente: novo }, { status: 201 });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
