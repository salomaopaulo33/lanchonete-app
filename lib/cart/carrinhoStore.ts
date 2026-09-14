import type { ItemCardapio } from "@/lib/domain/pedido";

export interface ItemCarrinho {
  item: ItemCardapio;
  quantidade: number;
}

/**
 * Armazenamento do carrinho fora do React, persistido em localStorage para
 * que o cliente não perca o pedido ao recarregar a página ou trocar de
 * aba. Exposto via useSyncExternalStore no CartContext, o que evita
 * diferenças entre o HTML do servidor (carrinho vazio) e o do navegador.
 */
const CHAVE = "nina-burguer:carrinho";
const VAZIO: ItemCarrinho[] = [];

let itens: ItemCarrinho[] = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

function carregarDoNavegador() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo) {
      const lido = JSON.parse(salvo) as ItemCarrinho[];
      if (Array.isArray(lido)) itens = lido.filter((i) => i?.item?.id && i.quantidade > 0);
    }
  } catch {
    itens = VAZIO;
  }
}

export function obterItens(): ItemCarrinho[] {
  carregarDoNavegador();
  return itens;
}

export function obterItensNoServidor(): ItemCarrinho[] {
  return VAZIO;
}

export function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function atualizarItens(atualizar: (atual: ItemCarrinho[]) => ItemCarrinho[]) {
  carregarDoNavegador();
  itens = atualizar(itens);
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(itens));
  } catch {
    // Sem localStorage (modo privado, etc.): o carrinho vive só em memória.
  }
  ouvintes.forEach((ouvinte) => ouvinte());
}
