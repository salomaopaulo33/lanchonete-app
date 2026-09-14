import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusPedido, type ItemDoPedido } from "@/components/pedido/StatusPedido";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Acompanhar pedido" };

/** Supabase devolve relações 1:1 ora como objeto, ora como lista de um item. */
function primeiro<T>(valor: T | T[] | null | undefined): T | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

export default async function PaginaPedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pedido } = await supabase
    .from("pedido")
    .select(
      "id, status, valor_total, taxa_entrega, tipo_entrega, endereco_entrega, item_pedido(quantidade, preco_unitario, item_cardapio(nome)), pagamento(status, forma_pagamento)",
    )
    .eq("id", id)
    .single();

  if (!pedido) notFound();

  const itens: ItemDoPedido[] = (pedido.item_pedido ?? []).map((item) => ({
    nome: primeiro(item.item_cardapio)?.nome ?? "Item",
    quantidade: Number(item.quantidade),
    precoUnitario: Number(item.preco_unitario),
  }));

  return (
    <div>
      <div className="mb-5 animate-subir">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Em tempo real</p>
        <h1 className="titulo-display mt-1 text-5xl">
          Acompanhar <span className="texto-dourado">pedido</span>
        </h1>
      </div>
      <StatusPedido
        pedidoInicial={{
          id: pedido.id,
          status: pedido.status,
          valor_total: Number(pedido.valor_total),
          taxa_entrega: Number(pedido.taxa_entrega ?? 0),
          tipo_entrega: pedido.tipo_entrega,
          endereco_entrega: pedido.endereco_entrega ?? null,
          pagamento: primeiro(pedido.pagamento),
          itens,
        }}
      />
    </div>
  );
}
