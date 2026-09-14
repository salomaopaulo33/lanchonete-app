"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/CartContext";

export function BarraCarrinho() {
  const { itens, valorTotal } = useCart();

  const quantidadeTotal = itens.reduce((total, i) => total + i.quantidade, 0);
  if (quantidadeTotal === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"}
          </p>
          <p className="font-semibold">
            {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
        <Button render={<Link href="/pedido/novo" />} size="lg">
          Ver pedido
        </Button>
      </div>
    </div>
  );
}
