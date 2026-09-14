"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ItemCardapio } from "@/lib/domain/pedido";

export interface ItemCarrinho {
  item: ItemCardapio;
  quantidade: number;
}

interface CartContextValue {
  itens: ItemCarrinho[];
  adicionarItem: (item: ItemCardapio) => void;
  removerItem: (itemId: string) => void;
  alterarQuantidade: (itemId: string, quantidade: number) => void;
  limparCarrinho: () => void;
  valorTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  function adicionarItem(item: ItemCardapio) {
    setItens((atual) => {
      const existente = atual.find((i) => i.item.id === item.id);
      if (existente) {
        return atual.map((i) =>
          i.item.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        );
      }
      return [...atual, { item, quantidade: 1 }];
    });
  }

  function removerItem(itemId: string) {
    setItens((atual) => atual.filter((i) => i.item.id !== itemId));
  }

  function alterarQuantidade(itemId: string, quantidade: number) {
    if (quantidade <= 0) {
      removerItem(itemId);
      return;
    }
    setItens((atual) => atual.map((i) => (i.item.id === itemId ? { ...i, quantidade } : i)));
  }

  function limparCarrinho() {
    setItens([]);
  }

  const valorTotal = useMemo(
    () => itens.reduce((total, i) => total + i.item.preco * i.quantidade, 0),
    [itens],
  );

  return (
    <CartContext.Provider
      value={{ itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho, valorTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de um CartProvider");
  return context;
}
