import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppError, toApiErrorResponse } from "@/lib/errors";
import { getPaymentClient, getPreferenceClient } from "@/lib/payments/mercadopago";

interface CorpoCheckout {
  pedidoId: string;
  formaPagamento: "pix" | "cartao" | "dinheiro_na_entrega";
}

/** POST /api/payments/checkout — inicia o pagamento de um pedido (FR-005). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { pedidoId, formaPagamento }: CorpoCheckout = await request.json();
  const origin = new URL(request.url).origin;
  const notificationUrl = `${origin}/api/payments/webhook`;

  try {
    const { data: pedido, error: erroPedido } = await supabase
      .from("pedido")
      .select("id, valor_total")
      .eq("id", pedidoId)
      .single();
    if (erroPedido || !pedido) throw new AppError("Pedido não encontrado.", 404);

    if (formaPagamento === "dinheiro_na_entrega") {
      const { data: pagamento, error } = await supabase
        .from("pagamento")
        .upsert(
          {
            pedido_id: pedidoId,
            forma_pagamento: formaPagamento,
            status: "a_pagar_na_entrega",
            valor: pedido.valor_total,
          },
          { onConflict: "pedido_id" },
        )
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ pagamento });
    }

    if (formaPagamento === "cartao") {
      // Cartão: usa o Checkout Pro (Preference) — o comprador paga na
      // página hospedada do Mercado Pago, que já lida com tokenização.
      const preferenceClient = getPreferenceClient();
      const preferencia = await preferenceClient.create({
        body: {
          items: [
            {
              id: pedido.id,
              title: `Pedido ${pedido.id}`,
              quantity: 1,
              unit_price: pedido.valor_total,
            },
          ],
          back_urls: {
            success: `${origin}/pedido/${pedido.id}`,
            pending: `${origin}/pedido/${pedido.id}`,
            failure: `${origin}/pedido/${pedido.id}/pagamento`,
          },
          auto_return: "approved",
          notification_url: notificationUrl,
        },
      });

      const { data: pagamento, error } = await supabase
        .from("pagamento")
        .upsert(
          {
            pedido_id: pedidoId,
            forma_pagamento: formaPagamento,
            status: "pendente",
            valor: pedido.valor_total,
            id_transacao_gateway: String(preferencia.id),
          },
          { onConflict: "pedido_id" },
        )
        .select()
        .single();
      if (error) throw error;

      return NextResponse.json({
        pagamento,
        checkoutUrl: preferencia.sandbox_init_point ?? preferencia.init_point,
      });
    }

    // Pix: cria o pagamento direto via API (gera QR code na hora).
    const paymentClient = getPaymentClient();
    const resultado = await paymentClient.create({
      body: {
        transaction_amount: pedido.valor_total,
        description: `Pedido ${pedido.id}`,
        payment_method_id: "pix",
        payer: { email: "cliente@example.com" },
        notification_url: notificationUrl,
      },
    });

    const { data: pagamento, error } = await supabase
      .from("pagamento")
      .upsert(
        {
          pedido_id: pedidoId,
          forma_pagamento: formaPagamento,
          status: "pendente",
          valor: pedido.valor_total,
          id_transacao_gateway: String(resultado.id),
        },
        { onConflict: "pedido_id" },
      )
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({
      pagamento,
      copiaECola: resultado.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: resultado.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
