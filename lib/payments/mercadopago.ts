import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

/**
 * Cliente do Mercado Pago (decisão registrada em research.md — gateway
 * escolhido por ter suporte nativo a Pix no Brasil).
 */
export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado em .env.local");
  }
  return new MercadoPagoConfig({ accessToken });
}

export function getPaymentClient() {
  return new Payment(getMercadoPagoClient());
}

export function getPreferenceClient() {
  return new Preference(getMercadoPagoClient());
}
