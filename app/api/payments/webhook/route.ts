import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPaymentClient } from "@/lib/payments/mercadopago";

const MAPA_STATUS_MERCADOPAGO = {
  approved: "pago",
  rejected: "recusado",
  refunded: "estornado",
  cancelled: "recusado",
} as const;

/**
 * POST /api/payments/webhook — recebido do Mercado Pago para confirmar
 * pagamento (FR-006). Não é chamado pelo frontend.
 */
export async function POST(request: Request) {
  const notificacao = await request.json();
  const paymentId = notificacao.data?.id;
  if (!paymentId) {
    return NextResponse.json({ ok: true });
  }

  const paymentClient = getPaymentClient();
  const pagamentoMp = await paymentClient.get({ id: paymentId });

  const novoStatus =
    MAPA_STATUS_MERCADOPAGO[pagamentoMp.status as keyof typeof MAPA_STATUS_MERCADOPAGO];
  if (!novoStatus) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceRoleClient();
  await supabase
    .from("pagamento")
    .update({
      status: novoStatus,
      pago_em: novoStatus === "pago" ? new Date().toISOString() : null,
    })
    .eq("id_transacao_gateway", String(paymentId));

  return NextResponse.json({ ok: true });
}
