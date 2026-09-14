"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { cn } from "cn";

/** Cabeçalho fixo da área do cliente: logo, atalho para o cardápio e carrinho. */
export function CabecalhoCliente() {
  const { quantidadeTotal } = useCart();
  const pathname = usePathname();
  const noCardapio = pathname === "/cardapio";

  return (
    <header className="vidro sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Página inicial da Nina Burguer">
          <span className="anel-dourado shrink-0">
            <Image
              src="/logo-nina-burguer.jpeg"
              alt=""
              width={40}
              height={40}
              className="block rounded-full"
              priority
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="titulo-display texto-dourado text-[1.65rem]">Nina Burguer</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Delivery
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {!noCardapio && (
            <Link
              href="/cardapio"
              className="hidden h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-secondary/50 hover:text-secondary sm:inline-flex"
            >
              <UtensilsCrossed className="size-4" />
              Cardápio
            </Link>
          )}
          <Link
            href="/pedido/novo"
            aria-label={
              quantidadeTotal > 0
                ? `Ver pedido, ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`
                : "Ver pedido"
            }
            className={cn(
              "relative grid size-10 place-items-center rounded-full border transition-colors",
              quantidadeTotal > 0
                ? "border-primary/60 bg-primary/15 text-primary hover:bg-primary/25"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <ShoppingBag className="size-5" />
            {quantidadeTotal > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground animate-surgir">
                {quantidadeTotal}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
