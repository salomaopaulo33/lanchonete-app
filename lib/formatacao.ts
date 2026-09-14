/** Formata um valor em reais (R$ 12,50). */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Aplica a máscara de telefone brasileiro enquanto a pessoa digita:
 * "(61) 99246-5458" para celular ou "(61) 3322-1100" para fixo.
 */
export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** Código curto e legível de um pedido, a partir do UUID. */
export function codigoCurtoPedido(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
