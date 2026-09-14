import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

/** Histórico de avaliações de atendimento (História 5). */
export default async function PaginaAvaliacoes() {
  const supabase = await createClient();
  const { data: avaliacoes } = await supabase
    .from("avaliacao")
    .select("id, pedido_id, nota, comentario, criado_em")
    .order("criado_em", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-secondary">Avaliações de atendimento</h1>

      {(!avaliacoes || avaliacoes.length === 0) && (
        <p className="text-muted-foreground">Ainda não há avaliações registradas.</p>
      )}

      {avaliacoes?.map((avaliacao) => (
        <Card key={avaliacao.id}>
          <CardContent className="pt-6">
            <p className="text-lg text-primary">{"★".repeat(avaliacao.nota)}{"☆".repeat(5 - avaliacao.nota)}</p>
            {avaliacao.comentario && <p className="mt-1 text-sm">{avaliacao.comentario}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Pedido {avaliacao.pedido_id.slice(0, 8)} ·{" "}
              {new Date(avaliacao.criado_em).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
