import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getMerchantOrderClient, getPaymentClient } from "@/lib/payments/mercadopago";

const MAPA_STATUS_MERCADOPAGO = {
  approved: "pago",
  rejected: "recusado",
  refunded: "estornado",
  cancelled: "recusado",
} as const;

async function aplicarStatus(
  pedidoId: string | undefined,
  paymentId: number | string | undefined,
  statusMp: string | undefined,
) {
  const novoStatus = MAPA_STATUS_MERCADOPAGO[statusMp as keyof typeof MAPA_STATUS_MERCADOPAGO];
  if (!novoStatus || !pedidoId || !paymentId) {
    return;
  }

  const supabase = createServiceRoleClient();
  await supabase
    .from("pagamento")
    .update({
      status: novoStatus,
      id_transacao_gateway: String(paymentId),
      pago_em: novoStatus === "pago" ? new Date().toISOString() : null,
    })
    .eq("pedido_id", pedidoId);
}

/**
 * POST /api/payments/webhook — recebido do Mercado Pago para confirmar
 * pagamento (FR-006). Não é chamado pelo frontend.
 *
 * O Mercado Pago notifica tanto no formato IPN legado (query string
 * ?topic=...&id=...) quanto no formato novo (corpo JSON {type, data.id}),
 * e manda o topic "merchant_order" (usado pelo Checkout Pro) além de
 * "payment" — cada um com um corpo diferente.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  let corpo: { data?: { id?: string }; type?: string; topic?: string } | null = null;
  try {
    corpo = await request.json();
  } catch {
    corpo = null;
  }

  const topico =
    url.searchParams.get("topic") ?? url.searchParams.get("type") ?? corpo?.type ?? corpo?.topic;
  const notificacaoId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? corpo?.data?.id;

  if (!notificacaoId) {
    return NextResponse.json({ ok: true });
  }

  if (topico === "merchant_order") {
    const merchantOrderClient = getMerchantOrderClient();
    const pedidoMp = await merchantOrderClient.get({ merchantOrderId: notificacaoId });

    const pagamentoMaisRecente = pedidoMp.payments?.at(-1);
    console.log("[webhook] merchant_order", {
      id: pedidoMp.id,
      external_reference: pedidoMp.external_reference,
      order_status: pedidoMp.order_status,
      payments: pedidoMp.payments,
    });
    await aplicarStatus(pedidoMp.external_reference, pagamentoMaisRecente?.id, pagamentoMaisRecente?.status);
    return NextResponse.json({ ok: true });
  }

  if (topico === "payment") {
    const paymentClient = getPaymentClient();
    const pagamentoMp = await paymentClient.get({ id: notificacaoId });

    await aplicarStatus(pagamentoMp.external_reference, pagamentoMp.id, pagamentoMp.status);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
