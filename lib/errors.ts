/**
 * Erro de aplicação com mensagem já pronta para mostrar ao usuário final,
 * em português simples (Princípio II da constituição: usabilidade
 * autoexplicativa). Nunca deve vazar detalhes técnicos (stack trace, nomes
 * de coluna, etc.) para a tela.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const mensagensErro = {
  itemIndisponivel: "Este item não está disponível no momento. Escolha outra opção do cardápio.",
  quantidadeInvalida: "A quantidade precisa ser maior que zero.",
  enderecoObrigatorio: "Informe o endereço de entrega para continuar.",
  pedidoNaoEncontrado: "Não encontramos esse pedido. Confira o número e tente de novo.",
  pagamentoRecusado: "O pagamento não foi aprovado. Tente novamente ou escolha outra forma de pagamento.",
  avaliacaoAntesDaHora: "Você poderá avaliar o atendimento assim que o pedido for concluído.",
  erroInesperado: "Algo deu errado do nosso lado. Tente novamente em instantes.",
} as const;

export function toApiErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status };
  }
  return { message: mensagensErro.erroInesperado, status: 500 };
}
