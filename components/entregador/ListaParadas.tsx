"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { gerarLinkWhatsApp, mensagensStatusPedido } from "@/lib/notifications/whatsapp";

interface Parada {
  id: string;
  ordem: number;
  status: "pendente" | "entregue" | "nao_entregue";
  pedido: { id: string; endereco_entrega: string | null; telefoneCliente: string | null };
}

export function ListaParadas({ rotaId, paradasIniciais }: { rotaId: string; paradasIniciais: Parada[] }) {
  const [paradas, setParadas] = useState(paradasIniciais);

  async function marcarStatus(paradaId: string, status: "entregue" | "nao_entregue") {
    await fetch(`/api/delivery-routes/${rotaId}/stops/${paradaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setParadas((atual) => atual.map((p) => (p.id === paradaId ? { ...p, status } : p)));
  }

  return (
    <div className="space-y-3">
      {paradas
        .sort((a, b) => a.ordem - b.ordem)
        .map((parada) => (
          <Card key={parada.id}>
            <CardContent className="space-y-2 pt-6">
              <p className="font-medium">
                Parada {parada.ordem} — Pedido {parada.pedido.id.slice(0, 8)}
              </p>
              <p className="text-sm text-muted-foreground">{parada.pedido.endereco_entrega}</p>
              {parada.status === "pendente" ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => marcarStatus(parada.id, "entregue")}>
                    Entregue
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => marcarStatus(parada.id, "nao_entregue")}
                  >
                    Não entregue
                  </Button>
                  {parada.pedido.telefoneCliente && (
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <a
                          href={gerarLinkWhatsApp(
                            parada.pedido.telefoneCliente,
                            mensagensStatusPedido.saiu_para_entrega(parada.pedido.id),
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      Avisar no WhatsApp
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium">
                  {parada.status === "entregue" ? "✅ Entregue" : "⚠️ Não entregue"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
