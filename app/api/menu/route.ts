import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

/** GET /api/menu — lista os itens disponíveis do cardápio, por categoria (FR-001). */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("item_cardapio")
    .select("id, nome, categoria, descricao, preco, disponivel, foto_url")
    .eq("disponivel", true)
    .order("categoria")
    .order("nome");

  if (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }

  return NextResponse.json({ itens: data });
}

/** POST /api/menu — cadastra um novo item do cardápio (uso interno/admin — FR-013). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const corpo = await request.json();

  const { data, error } = await supabase
    .from("item_cardapio")
    .insert({
      nome: corpo.nome,
      categoria: corpo.categoria,
      descricao: corpo.descricao ?? null,
      preco: corpo.preco,
      disponivel: corpo.disponivel ?? true,
      foto_url: corpo.fotoUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
