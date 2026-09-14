import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppError, toApiErrorResponse } from "@/lib/errors";
import { getPaymentClient } from "@/lib/payments/mercadopago";

interface CorpoCheckout {
  pedidoId: string;
  formaPagamento: "pix" | "cartao" | "dinheiro_na_entrega";
}

/** POST /api/payments/checkout — inicia o pagamento de um pedido (FR-005). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { pedidoId, formaPagamento }: CorpoCheckout = await request.json();

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

    // Pix ou cartão: cria a preferência/pagamento no Mercado Pago.
    const paymentClient = getPaymentClient();
    const resultado = await paymentClient.create({
      body: {
        transaction_amount: pedido.valor_total,
        description: `Pedido ${pedido.id}`,
        payment_method_id: formaPagamento === "pix" ? "pix" : undefined,
        payer: { email: "cliente@example.com" },
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
      qrCode: resultado.point_of_interaction?.transaction_data?.qr_code,
      copiaECola: resultado.point_of_interaction?.transaction_data?.qr_code_base64,
      checkoutUrl: (resultado as unknown as { init_point?: string }).init_point,
    });
  } catch (error) {
    const { message, status } = toApiErrorResponse(error);
    return NextResponse.json({ erro: message }, { status });
  }
}
