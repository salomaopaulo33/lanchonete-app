"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/CartContext";
import { formatarMoeda } from "@/lib/formatacao";
import type { CategoriaItem, ItemCardapio } from "@/lib/domain/pedido";
import { CATEGORIAS } from "@/components/cardapio/categorias";
import { FotoItem } from "@/components/cardapio/FotoItem";
import { ControleQuantidade } from "@/components/carrinho/ControleQuantidade";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function ListaCardapio({ itens }: { itens: ItemCardapio[] }) {
  const { adicionarItem, alterarQuantidade, quantidadeDoItem } = useCart();
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaItem | null>(null);
  const secoesRef = useRef<Map<CategoriaItem, HTMLElement>>(new Map());

  const termo = normalizar(busca.trim());
  const itensFiltrados = termo
    ? itens.filter(
        (item) =>
          normalizar(item.nome).includes(termo) ||
          (item.descricao ? normalizar(item.descricao).includes(termo) : false),
      )
    : itens;

  const categoriasVisiveis = CATEGORIAS.filter((c) =>
    itensFiltrados.some((item) => item.categoria === c.id),
  );
  const chaveCategorias = categoriasVisiveis.map((c) => c.id).join(",");

  // Destaca no menu de categorias a seção que está na tela.
  useEffect(() => {
    const elementos = Array.from(secoesRef.current.values());
    if (elementos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setCategoriaAtiva(visivel.target.id as CategoriaItem);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 },
    );
    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [chaveCategorias]);

  function irParaCategoria(id: CategoriaItem) {
    secoesRef.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (itens.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="titulo-display text-3xl text-secondary">Já já tem novidade</p>
        <p className="mt-2 text-muted-foreground">
          O cardápio ainda não tem itens cadastrados. Volte em instantes!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Busca + categorias, fixas logo abaixo do cabeçalho. */}
      <div className="vidro sticky top-16 z-30 -mx-4 space-y-3 border-x-0 px-4 py-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no cardápio"
            aria-label="Buscar no cardápio"
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/30"
          />
          {busca && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setBusca("")}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        {categoriasVisiveis.length > 1 && (
          <nav aria-label="Categorias" className="sem-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {categoriasVisiveis.map(({ id, nome, Icone }) => {
              const ativa = categoriaAtiva === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => irParaCategoria(id)}
                  aria-current={ativa ? "true" : undefined}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all",
                    ativa
                      ? "border-secondary bg-secondary text-secondary-foreground shadow-[0_6px_20px_-8px_var(--secondary)]"
                      : "border-border bg-card text-muted-foreground hover:border-secondary/50 hover:text-foreground",
                  )}
                >
                  <Icone className="size-4" />
                  {nome}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {itensFiltrados.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          Nada encontrado para <strong className="text-foreground">“{busca}”</strong>. Tente outro nome.
        </p>
      )}

      <div className="mt-6 space-y-10">
        {categoriasVisiveis.map((categoria, indice) => {
          const itensDaCategoria = itensFiltrados.filter((item) => item.categoria === categoria.id);
          return (
            <section
              key={categoria.id}
              id={categoria.id}
              ref={(el) => {
                if (el) secoesRef.current.set(categoria.id, el);
                else secoesRef.current.delete(categoria.id);
              }}
              className="scroll-mt-48 animate-subir"
              style={{ animationDelay: `${indice * 80}ms` }}
            >
              <div className="mb-4 flex items-end justify-between">
                <h2 className="titulo-display text-4xl text-secondary">{categoria.nome}</h2>
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {itensDaCategoria.length} {itensDaCategoria.length === 1 ? "opção" : "opções"}
                </span>
              </div>

              <ul className="space-y-3">
                {itensDaCategoria.map((item) => {
                  const quantidade = quantidadeDoItem(item.id);
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "group flex gap-4 rounded-2xl border bg-card p-3 transition-all",
                        quantidade > 0
                          ? "border-primary/50 shadow-[0_10px_30px_-18px_var(--primary)]"
                          : "border-border/60 hover:border-secondary/40",
                      )}
                    >
                      <FotoItem item={item} className="size-24 shrink-0 rounded-xl sm:size-28" />

                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="font-semibold leading-tight">{item.nome}</h3>
                        {item.descricao && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.descricao}</p>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                          <span className="text-lg font-bold text-primary tabular-nums">
                            {formatarMoeda(item.preco)}
                          </span>
                          {quantidade === 0 ? (
                            <Button
                              size="sm"
                              className="h-9 rounded-full px-4"
                              onClick={() => adicionarItem(item)}
                            >
                              <Plus data-icon="inline-start" />
                              Adicionar
                            </Button>
                          ) : (
                            <ControleQuantidade
                              quantidade={quantidade}
                              nomeItem={item.nome}
                              onAlterar={(q) => alterarQuantidade(item.id, q)}
                            />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
