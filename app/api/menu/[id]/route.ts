import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

interface Params {
  params: Promise<{ id: string }>;
}

/** PATCH /api/menu/{id} — edita um item do cardápio (uso interno/admin — FR-013). */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const corpo = await request.json();

  const campos: Record<string, unknown> = {};
  if (corpo.nome !== undefined) campos.nome = corpo.nome;
  if (corpo.categoria !== undefined) campos.categoria = corpo.categoria;
  if (corpo.descricao !== undefined) campos.descricao = corpo.descricao;
  if (corpo.preco !== undefined) campos.preco = corpo.preco;
  if (corpo.disponivel !== undefined) campos.disponivel = corpo.disponivel;
  if (corpo.fotoUrl !== undefined) campos.foto_url = corpo.fotoUrl;

  const { data, error } = await supabase
    .from("item_cardapio")
    .update(campos)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }

  return NextResponse.json({ item: data });
}

/** DELETE /api/menu/{id} — remove um item do cardápio (uso interno/admin — FR-013). */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("item_cardapio").delete().eq("id", id);

  if (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }

  return NextResponse.json({ sucesso: true });
}
