"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/lib/cart/CartContext";
import type { CategoriaItem, ItemCardapio } from "@/lib/domain/pedido";

const NOMES_CATEGORIA: Record<CategoriaItem, string> = {
  hamburguer: "Hambúrgueres",
  bebida: "Bebidas",
  lanche: "Lanches",
  salada: "Saladas",
};

const ORDEM_CATEGORIAS: CategoriaItem[] = ["hamburguer", "lanche", "salada", "bebida"];

export function ListaCardapio({ itens }: { itens: ItemCardapio[] }) {
  const { adicionarItem } = useCart();

  if (itens.length === 0) {
    return (
      <p className="mt-8 text-center text-muted-foreground">
        O cardápio ainda não tem itens cadastrados. Volte em instantes!
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {ORDEM_CATEGORIAS.map((categoria) => {
        const itensDaCategoria = itens.filter((item) => item.categoria === categoria);
        if (itensDaCategoria.length === 0) return null;

        return (
          <section key={categoria}>
            <h2 className="mb-3 text-lg font-semibold text-secondary">
              {NOMES_CATEGORIA[categoria]}
            </h2>
            <div className="space-y-3">
              {itensDaCategoria.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{item.nome}</CardTitle>
                      {item.descricao && (
                        <p className="mt-1 text-sm text-muted-foreground">{item.descricao}</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <span className="font-medium">
                      {item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <Button size="sm" onClick={() => adicionarItem(item)}>
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
