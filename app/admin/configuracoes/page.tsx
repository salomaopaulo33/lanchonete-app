import { createClient } from "@/lib/supabase/server";
import { ConfiguracaoTema } from "@/components/admin/ConfiguracaoTema";

export const dynamic = "force-dynamic";

/** Configuração da paleta de cores oficial da lanchonete (FR-014). */
export default async function PaginaConfiguracoes() {
  const supabase = await createClient();
  const { data } = await supabase.from("configuracao_tema").select("chave, valor");
  const tema = Object.fromEntries((data ?? []).map((linha) => [linha.chave, linha.valor]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Configurações — Identidade Visual</h1>
      <p className="text-sm text-muted-foreground">
        Defina aqui as cores oficiais da lanchonete. Elas serão aplicadas em todo o site, sem
        precisar mexer em código (Princípio III da constituição do projeto).
      </p>
      <ConfiguracaoTema temaInicial={tema} />
    </div>
  );
}
