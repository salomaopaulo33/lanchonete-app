import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListaCardapio } from "@/components/cardapio/ListaCardapio";
import { BarraCarrinho } from "@/components/carrinho/BarraCarrinho";
import type { ItemCardapio } from "@/lib/domain/pedido";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Cardápio" };

export default async function PaginaCardapio() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("item_cardapio")
    .select("id, nome, categoria, descricao, preco, disponivel, foto_url")
    .eq("disponivel", true)
    .order("categoria")
    .order("nome");

  const itens: ItemCardapio[] = (data ?? []).map((item) => ({
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    descricao: item.descricao,
    preco: Number(item.preco),
    disponivel: item.disponivel,
    fotoUrl: item.foto_url,
  }));

  return (
    <>
      <div className="mb-4 animate-subir">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Feito na hora</p>
        <h1 className="titulo-display mt-1 text-5xl">
          Nosso <span className="texto-dourado">cardápio</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha o que quiser, ajuste as quantidades e finalize em segundos.
        </p>
      </div>
      <ListaCardapio itens={itens} />
      <BarraCarrinho />
    </>
  );
}
