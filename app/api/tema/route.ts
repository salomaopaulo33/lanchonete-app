import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

/** GET /api/tema — paleta de cores configurada (FR-014). */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("configuracao_tema").select("chave, valor");

  if (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }

  const tema = Object.fromEntries((data ?? []).map((linha) => [linha.chave, linha.valor]));
  return NextResponse.json({ tema });
}

/** POST /api/tema — atualiza uma ou mais cores da paleta (uso interno/admin — FR-014). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const cores: Record<string, string> = await request.json();

  try {
    const linhas = Object.entries(cores).map(([chave, valor]) => ({ chave, valor }));
    const { error } = await supabase.from("configuracao_tema").upsert(linhas);
    if (error) throw error;

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
