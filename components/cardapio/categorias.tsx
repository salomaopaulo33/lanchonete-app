import { Beef, CupSoda, Salad, Sandwich, type LucideIcon } from "lucide-react";
import type { CategoriaItem } from "@/lib/domain/pedido";

export interface InfoCategoria {
  id: CategoriaItem;
  nome: string;
  Icone: LucideIcon;
  /** Degradê usado no lugar da foto quando o item não tem imagem. */
  degrade: string;
}

/** Categorias do cardápio, na ordem em que aparecem para o cliente. */
export const CATEGORIAS: InfoCategoria[] = [
  {
    id: "hamburguer",
    nome: "Hambúrgueres",
    Icone: Beef,
    degrade: "from-orange-500/40 via-amber-700/30 to-stone-900",
  },
  {
    id: "lanche",
    nome: "Lanches",
    Icone: Sandwich,
    degrade: "from-yellow-500/35 via-amber-800/30 to-stone-900",
  },
  {
    id: "salada",
    nome: "Saladas",
    Icone: Salad,
    degrade: "from-lime-500/35 via-emerald-800/30 to-stone-900",
  },
  {
    id: "bebida",
    nome: "Bebidas",
    Icone: CupSoda,
    degrade: "from-sky-500/35 via-indigo-800/30 to-stone-900",
  },
];

export function infoDaCategoria(id: CategoriaItem): InfoCategoria {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0];
}
