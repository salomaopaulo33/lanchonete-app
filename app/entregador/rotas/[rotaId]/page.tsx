import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListaParadas } from "@/components/entregador/ListaParadas";

export const dynamic = "force-dynamic";

/** Tela do entregador para acompanhar e marcar as paradas de uma rota (História 4). */
export default async function PaginaRotaEntregador({
  params,
}: {
  params: Promise<{ rotaId: string }>;
}) {
  const { rotaId } = await params;
  const supabase = await createClient();

  const { data: paradas } = await supabase
    .from("parada_entrega")
    .select(
      "id, ordem, status, pedido:pedido_id(id, endereco_entrega, cliente:cliente_id(telefone))",
    )
    .eq("rota_id", rotaId);

  if (!paradas) notFound();

  const paradasFormatadas = paradas.map((p) => {
    const pedido = Array.isArray(p.pedido) ? p.pedido[0] : p.pedido;
    const cliente = Array.isArray(pedido?.cliente) ? pedido.cliente[0] : pedido?.cliente;
    return { ...p, pedido: { ...pedido, telefoneCliente: cliente?.telefone ?? null } };
  });

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary">Minha rota de entregas</h1>
      <ListaParadas rotaId={rotaId} paradasIniciais={paradasFormatadas} />
    </div>
  );
}
