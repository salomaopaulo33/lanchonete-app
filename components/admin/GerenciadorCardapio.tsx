"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoriaItem, ItemCardapio } from "@/lib/domain/pedido";

const CATEGORIAS: { valor: CategoriaItem; rotulo: string }[] = [
  { valor: "hamburguer", rotulo: "Hambúrguer" },
  { valor: "bebida", rotulo: "Bebida" },
  { valor: "lanche", rotulo: "Lanche" },
  { valor: "salada", rotulo: "Salada" },
];

export function GerenciadorCardapio({ itensIniciais }: { itensIniciais: ItemCardapio[] }) {
  const [itens, setItens] = useState(itensIniciais);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<CategoriaItem>("hamburguer");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function cadastrarItem() {
    setErro(null);
    if (!nome.trim() || !preco) {
      setErro("Preencha ao menos o nome e o preço do item.");
      return;
    }
    setSalvando(true);
    try {
      const resposta = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, categoria, preco: Number(preco), descricao }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);

      setItens((atual) => [
        ...atual,
        {
          id: dados.item.id,
          nome: dados.item.nome,
          categoria: dados.item.categoria,
          descricao: dados.item.descricao,
          preco: Number(dados.item.preco),
          disponivel: dados.item.disponivel,
          fotoUrl: dados.item.foto_url,
        },
      ]);
      setNome("");
      setPreco("");
      setDescricao("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível cadastrar o item.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarDisponibilidade(item: ItemCardapio) {
    const disponivel = !item.disponivel;
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponivel }),
    });
    setItens((atual) => atual.map((i) => (i.id === item.id ? { ...i, disponivel } : i)));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="font-semibold">Cadastrar novo item</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="nome-item">Nome</Label>
              <Input id="nome-item" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="preco-item">Preço (R$)</Label>
              <Input
                id="preco-item"
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Categoria</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {CATEGORIAS.map((c) => (
                <Button
                  key={c.valor}
                  type="button"
                  size="sm"
                  variant={categoria === c.valor ? "default" : "outline"}
                  onClick={() => setCategoria(c.valor)}
                >
                  {c.rotulo}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="descricao-item">Descrição (opcional)</Label>
            <Input
              id="descricao-item"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Button onClick={cadastrarItem} disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar item"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="font-semibold">Itens cadastrados</h2>
        {itens.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">{item.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {item.categoria} ·{" "}
                  {item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <Button
                size="sm"
                variant={item.disponivel ? "outline" : "default"}
                onClick={() => alternarDisponibilidade(item)}
              >
                {item.disponivel ? "Marcar indisponível" : "Marcar disponível"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
