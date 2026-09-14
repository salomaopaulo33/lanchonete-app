"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PedidoPronto {
  id: string;
  endereco_entrega: string | null;
}

interface Entregador {
  id: string;
  nome: string;
}

export function MontarRotaEntrega({
  pedidosProntos,
  entregadores,
}: {
  pedidosProntos: PedidoPronto[];
  entregadores: Entregador[];
}) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [entregadorId, setEntregadorId] = useState(entregadores[0]?.id ?? "");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  function alternarSelecao(pedidoId: string) {
    setSelecionados((atual) =>
      atual.includes(pedidoId) ? atual.filter((id) => id !== pedidoId) : [...atual, pedidoId],
    );
  }

  async function criarRota() {
    if (!entregadorId || selecionados.length === 0) {
      setMensagem("Escolha um entregador e pelo menos um pedido.");
      return;
    }
    setEnviando(true);
    setMensagem(null);
    try {
      const resposta = await fetch("/api/delivery-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entregadorId, pedidosIds: selecionados }),
      });
      if (!resposta.ok) throw new Error();
      setMensagem("Rota criada! Atualize a página para ver a lista de pedidos pendentes.");
      setSelecionados([]);
    } catch {
      setMensagem("Não foi possível criar a rota agora.");
    } finally {
      setEnviando(false);
    }
  }

  if (pedidosProntos.length === 0) {
    return <p className="text-muted-foreground">Nenhum pedido pronto para entrega no momento.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {pedidosProntos.map((pedido) => (
          <Card key={pedido.id}>
            <CardContent className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                checked={selecionados.includes(pedido.id)}
                onChange={() => alternarSelecao(pedido.id)}
              />
              <div>
                <p className="font-medium">Pedido {pedido.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{pedido.endereco_entrega}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={entregadorId}
          onChange={(e) => setEntregadorId(e.target.value)}
        >
          {entregadores.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
        <Button onClick={criarRota} disabled={enviando}>
          {enviando ? "Criando rota..." : "Criar rota com selecionados"}
        </Button>
      </div>

      {mensagem && <p className="text-sm">{mensagem}</p>}
    </div>
  );
}
