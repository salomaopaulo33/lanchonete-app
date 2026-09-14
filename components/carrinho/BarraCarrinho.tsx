"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { formatarMoeda } from "@/lib/formatacao";

/** Barra flutuante com o resumo do carrinho, visível enquanto há itens. */
export function BarraCarrinho() {
  const { quantidadeTotal, valorTotal } = useCart();
  if (quantidadeTotal === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto max-w-2xl animate-subir">
        <Link
          href="/pedido/novo"
          className="brilho-primario flex items-center justify-between gap-4 rounded-2xl bg-primary px-4 py-3 text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center gap-3">
            <span className="relative grid size-10 place-items-center rounded-full bg-black/25">
              <ShoppingBag className="size-5" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-primary">
                {quantidadeTotal}
              </span>
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Ver pedido</span>
              <span className="text-xs text-primary-foreground/80">
                {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"} no carrinho
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2 text-lg font-bold tabular-nums">
            {formatarMoeda(valorTotal)}
            <ArrowRight className="size-5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
