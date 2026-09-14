import { createClient } from "@/lib/supabase/server";
import { MontarRotaEntrega } from "@/components/admin/MontarRotaEntrega";

export const dynamic = "force-dynamic";

/** Organização de rotas de entrega (História 4 — FR-008). */
export default async function PaginaRotas() {
  const supabase = await createClient();

  const [{ data: pedidosProntos }, { data: entregadores }] = await Promise.all([
    supabase
      .from("pedido")
      .select("id, endereco_entrega")
      .eq("tipo_entrega", "entrega")
      .eq("status", "pronto"),
    supabase.from("entregador").select("id, nome").eq("ativo", true),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Rotas de entrega</h1>
      <MontarRotaEntrega pedidosProntos={pedidosProntos ?? []} entregadores={entregadores ?? []} />
    </div>
  );
}
