import { createClient } from "@/lib/supabase/server";
import { ListaCardapio } from "@/components/cardapio/ListaCardapio";
import { BarraCarrinho } from "@/components/carrinho/BarraCarrinho";
import type { ItemCardapio } from "@/lib/domain/pedido";

export const dynamic = "force-dynamic";

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
      <h1 className="mb-6 text-2xl font-bold text-secondary">Cardápio</h1>
      <ListaCardapio itens={itens} />
      <BarraCarrinho />
    </>
  );
}
