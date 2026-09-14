"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "cn";

interface ControleQuantidadeProps {
  quantidade: number;
  onAlterar: (quantidade: number) => void;
  /** Rótulo acessível do item, usado nos botões (ex.: "X-Bacon"). */
  nomeItem: string;
  className?: string;
}

/** Botões − / + em formato de pílula. Com 1 unidade, o "−" vira lixeira. */
export function ControleQuantidade({ quantidade, onAlterar, nomeItem, className }: ControleQuantidadeProps) {
  const IconeMenos = quantidade <= 1 ? Trash2 : Minus;

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-primary/40 bg-primary/10 p-0.5 text-foreground",
        className,
      )}
    >
      <button
        type="button"
        aria-label={quantidade <= 1 ? `Remover ${nomeItem}` : `Diminuir ${nomeItem}`}
        onClick={() => onAlterar(quantidade - 1)}
        className="grid size-8 place-items-center rounded-full transition-colors hover:bg-primary/25 active:scale-95"
      >
        <IconeMenos className="size-4" />
      </button>
      <span
        aria-live="polite"
        className="min-w-7 text-center text-sm font-bold tabular-nums"
      >
        {quantidade}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${nomeItem}`}
        onClick={() => onAlterar(quantidade + 1)}
        className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/85 active:scale-95"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
