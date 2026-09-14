"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart/CartContext";

export default function NovoPedidoPage() {
  const router = useRouter();
  const { itens, valorTotal, limparCarrinho } = useCart();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"retirada" | "entrega">("retirada");
  const [endereco, setEndereco] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarPedido() {
    setErro(null);

    if (!nome.trim() || !telefone.trim()) {
      setErro("Preencha seu nome e telefone para continuar.");
      return;
    }
    if (tipoEntrega === "entrega" && !endereco.trim()) {
      setErro("Informe o endereço de entrega.");
      return;
    }
    if (itens.length === 0) {
      setErro("Seu carrinho está vazio. Volte ao cardápio e escolha algo gostoso!");
      return;
    }

    setEnviando(true);
    try {
      const respostaCliente = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone }),
      });
      const { cliente, erro: erroCliente } = await respostaCliente.json();
      if (!respostaCliente.ok) throw new Error(erroCliente);

      const respostaPedido = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          tipoEntrega,
          enderecoEntrega: tipoEntrega === "entrega" ? endereco : undefined,
          itens: itens.map((i) => ({ itemCardapioId: i.item.id, quantidade: i.quantidade })),
        }),
      });
      const { pedido, erro: erroPedido } = await respostaPedido.json();
      if (!respostaPedido.ok) throw new Error(erroPedido);

      limparCarrinho();
      router.push(`/pedido/${pedido.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar o pedido. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Finalizar pedido</h1>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="font-semibold">Seus itens</h2>
          {itens.map((i) => (
            <div key={i.item.id} className="flex justify-between text-sm">
              <span>
                {i.quantidade}x {i.item.nome}
              </span>
              <span>
                {(i.item.preco * i.quantidade).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span>{valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <Label htmlFor="nome">Seu nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="telefone">Seu telefone (com WhatsApp)</Label>
          <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>

        <div>
          <Label>Como você quer receber?</Label>
          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant={tipoEntrega === "retirada" ? "default" : "outline"}
              onClick={() => setTipoEntrega("retirada")}
            >
              Retirar no local
            </Button>
            <Button
              type="button"
              variant={tipoEntrega === "entrega" ? "default" : "outline"}
              onClick={() => setTipoEntrega("entrega")}
            >
              Entregar
            </Button>
          </div>
        </div>

        {tipoEntrega === "entrega" && (
          <div>
            <Label htmlFor="endereco">Endereço de entrega</Label>
            <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </div>
        )}
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Button className="w-full" size="lg" onClick={enviarPedido} disabled={enviando}>
        {enviando ? "Enviando..." : "Confirmar pedido"}
      </Button>
    </div>
  );
}
