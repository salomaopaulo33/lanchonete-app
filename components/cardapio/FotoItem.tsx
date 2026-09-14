import Image from "next/image";
import { cn } from "cn";
import type { ItemCardapio } from "@/lib/domain/pedido";
import { infoDaCategoria } from "@/components/cardapio/categorias";

interface FotoItemProps {
  item: Pick<ItemCardapio, "nome" | "categoria" | "fotoUrl">;
  className?: string;
  sizes?: string;
}

/**
 * Foto do item do cardápio. Sem foto cadastrada, mostra um cartão com o
 * ícone da categoria sobre um degradê, para a lista continuar bonita.
 */
export function FotoItem({ item, className, sizes = "96px" }: FotoItemProps) {
  const categoria = infoDaCategoria(item.categoria);

  if (item.fotoUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image src={item.fotoUrl} alt={item.nome} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid place-items-center overflow-hidden bg-gradient-to-br text-primary-foreground/80",
        categoria.degrade,
        className,
      )}
    >
      <categoria.Icone className="size-[38%] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" strokeWidth={1.6} />
    </div>
  );
}
