import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusPedido } from "@/components/pedido/StatusPedido";

export const dynamic = "force-dynamic";

export default async function PaginaPedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pedido } = await supabase
    .from("pedido")
    .select("id, status, valor_total, tipo_entrega, pagamento(status, forma_pagamento)")
    .eq("id", id)
    .single();

  if (!pedido) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-secondary">Acompanhar pedido</h1>
      <StatusPedido
        pedidoInicial={{
          ...pedido,
          pagamento: Array.isArray(pedido.pagamento) ? pedido.pagamento[0] ?? null : pedido.pagamento,
        }}
      />
    </div>
  );
}
