import { createClient } from "@/lib/supabase/server";
import { GerenciadorCardapio } from "@/components/admin/GerenciadorCardapio";
import type { ItemCardapio } from "@/lib/domain/pedido";

export const dynamic = "force-dynamic";

/** Cadastro do cardápio pela equipe da lanchonete (FR-013). */
export default async function PaginaCardapioAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("item_cardapio")
    .select("id, nome, categoria, descricao, preco, disponivel, foto_url")
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Cardápio</h1>
      <GerenciadorCardapio itensIniciais={itens} />
    </div>
  );
}
