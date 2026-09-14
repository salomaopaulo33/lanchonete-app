"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { StatusPedido as StatusPedidoTipo } from "@/lib/domain/pedido";

const TEXTO_STATUS: Record<StatusPedidoTipo, string> = {
  recebido: "Recebemos seu pedido!",
  em_preparo: "Seu pedido está sendo preparado",
  pronto: "Seu pedido está pronto",
  saiu_para_entrega: "Seu pedido saiu para entrega",
  entregue: "Pedido entregue",
  retirado: "Pedido retirado",
  avaliado: "Pedido concluído",
  cancelado: "Pedido cancelado",
};

interface PedidoDetalhado {
  id: string;
  status: StatusPedidoTipo;
  valor_total: number;
  tipo_entrega: "retirada" | "entrega";
  pagamento: { status: string; forma_pagamento: string } | null;
}

export function StatusPedido({ pedidoInicial }: { pedidoInicial: PedidoDetalhado }) {
  const [pedido, setPedido] = useState(pedidoInicial);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel(`pedido-${pedido.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedido", filter: `id=eq.${pedido.id}` },
        (payload) => {
          const novoPedido = payload.new as { status: StatusPedidoTipo };
          setPedido((atual) => ({ ...atual, status: novoPedido.status }));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pagamento", filter: `pedido_id=eq.${pedido.id}` },
        (payload) => {
          const novoPagamento = payload.new as { status: string; forma_pagamento: string };
          setPedido((atual) => ({ ...atual, pagamento: novoPagamento }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [pedido.id]);

  const podeAvaliar = pedido.status === "entregue" || pedido.status === "retirado";
  const precisaPagar = !pedido.pagamento || pedido.pagamento.status === "pendente";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">Pedido #{pedido.id.slice(0, 8)}</p>
          <p className="text-xl font-semibold text-secondary">{TEXTO_STATUS[pedido.status]}</p>
          <p className="text-sm">
            Valor total:{" "}
            <strong>
              {Number(pedido.valor_total).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </strong>
          </p>
          {pedido.pagamento && (
            <p className="text-sm text-muted-foreground">
              Pagamento: {pedido.pagamento.status === "pago" ? "confirmado" : pedido.pagamento.status}
            </p>
          )}
        </CardContent>
      </Card>

      {precisaPagar && (
        <Button
          render={<Link href={`/pedido/${pedido.id}/pagamento`} />}
          className="w-full"
          size="lg"
        >
          Pagar agora
        </Button>
      )}

      {podeAvaliar && (
        <Button render={<Link href={`/pedido/${pedido.id}/avaliacao`} />} variant="outline" className="w-full">
          Avaliar atendimento
        </Button>
      )}
    </div>
  );
}
