import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toApiErrorResponse } from "@/lib/errors";

/** GET /api/payments/report?inicio=YYYY-MM-DD&fim=YYYY-MM-DD — recebimentos do período (FR-007). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio") ?? new Date().toISOString().slice(0, 10);
  const fim = searchParams.get("fim") ?? inicio;
  const supabase = await createClient();

  try {
    const { data: pagamentos, error } = await supabase
      .from("pagamento")
      .select("pedido_id, valor, forma_pagamento, status, pago_em")
      .gte("pago_em", `${inicio}T00:00:00`)
      .lte("pago_em", `${fim}T23:59:59`);
    if (error) throw error;

    const totalRecebido = pagamentos
      .filter((p) => p.status === "pago")
      .reduce((total, p) => total + Number(p.valor), 0);

    const porFormaPagamento: Record<string, number> = {};
    for (const pagamento of pagamentos) {
      if (pagamento.status !== "pago") continue;
      porFormaPagamento[pagamento.forma_pagamento] =
        (porFormaPagamento[pagamento.forma_pagamento] ?? 0) + Number(pagamento.valor);
    }

    return NextResponse.json({ totalRecebido, porFormaPagamento, pagamentos });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
