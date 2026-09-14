import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

const NOMES_FORMA_PAGAMENTO: Record<string, string> = {
  pix: "Pix",
  cartao: "Cartão",
  dinheiro_na_entrega: "Dinheiro na entrega",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Página de recebimentos financeiros (História 3 — FR-007). */
export default async function PaginaRecebimentos({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const { inicio, fim } = await searchParams;
  const hoje = new Date().toISOString().slice(0, 10);
  const dataInicio = inicio ?? hoje;
  const dataFim = fim ?? dataInicio;

  const supabase = await createClient();
  const { data: pagamentos } = await supabase
    .from("pagamento")
    .select("pedido_id, valor, forma_pagamento, status, pago_em")
    .gte("pago_em", `${dataInicio}T00:00:00`)
    .lte("pago_em", `${dataFim}T23:59:59`);

  const lista = pagamentos ?? [];
  const totalRecebido = lista
    .filter((p) => p.status === "pago")
    .reduce((total, p) => total + Number(p.valor), 0);

  const porForma: Record<string, number> = {};
  for (const p of lista) {
    if (p.status !== "pago") continue;
    porForma[p.forma_pagamento] = (porForma[p.forma_pagamento] ?? 0) + Number(p.valor);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Recebimentos</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total recebido no período</p>
            <p className="text-2xl font-bold">{formatarMoeda(totalRecebido)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 pt-6">
            {Object.entries(porForma).map(([forma, valor]) => (
              <p key={forma} className="text-sm">
                {NOMES_FORMA_PAGAMENTO[forma] ?? forma}: <strong>{formatarMoeda(valor)}</strong>
              </p>
            ))}
            {Object.keys(porForma).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum recebimento no período.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Forma</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.map((p) => (
            <TableRow key={p.pedido_id}>
              <TableCell>{p.pedido_id.slice(0, 8)}</TableCell>
              <TableCell>{NOMES_FORMA_PAGAMENTO[p.forma_pagamento] ?? p.forma_pagamento}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell className="text-right">{formatarMoeda(Number(p.valor))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
