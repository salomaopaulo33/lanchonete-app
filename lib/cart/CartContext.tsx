"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { ItemCardapio } from "@/lib/domain/pedido";
import {
  assinar,
  atualizarItens,
  obterItens,
  obterItensNoServidor,
  type ItemCarrinho,
} from "@/lib/cart/carrinhoStore";

export type { ItemCarrinho } from "@/lib/cart/carrinhoStore";

interface CartContextValue {
  itens: ItemCarrinho[];
  adicionarItem: (item: ItemCardapio) => void;
  removerItem: (itemId: string) => void;
  alterarQuantidade: (itemId: string, quantidade: number) => void;
  quantidadeDoItem: (itemId: string) => number;
  limparCarrinho: () => void;
  valorTotal: number;
  quantidadeTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function adicionarItem(item: ItemCardapio) {
  atualizarItens((atual) => {
    const existente = atual.find((i) => i.item.id === item.id);
    if (existente) {
      return atual.map((i) => (i.item.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    }
    return [...atual, { item, quantidade: 1 }];
  });
}

function removerItem(itemId: string) {
  atualizarItens((atual) => atual.filter((i) => i.item.id !== itemId));
}

function alterarQuantidade(itemId: string, quantidade: number) {
  if (quantidade <= 0) {
    removerItem(itemId);
    return;
  }
  atualizarItens((atual) => atual.map((i) => (i.item.id === itemId ? { ...i, quantidade } : i)));
}

function limparCarrinho() {
  atualizarItens(() => []);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const itens = useSyncExternalStore(assinar, obterItens, obterItensNoServidor);

  const valor = useMemo<CartContextValue>(() => {
    const valorTotal = itens.reduce((total, i) => total + i.item.preco * i.quantidade, 0);
    const quantidadeTotal = itens.reduce((total, i) => total + i.quantidade, 0);
    return {
      itens,
      adicionarItem,
      removerItem,
      alterarQuantidade,
      quantidadeDoItem: (itemId) => itens.find((i) => i.item.id === itemId)?.quantidade ?? 0,
      limparCarrinho,
      valorTotal,
      quantidadeTotal,
    };
  }, [itens]);

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de um CartProvider");
  return context;
}
