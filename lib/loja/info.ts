/**
 * Informações institucionais da lanchonete usadas na página inicial e no
 * rodapé. Centralizadas aqui para que uma mudança (novo horário, novo
 * telefone) não exija caçar textos espalhados pelos componentes.
 */
export const HORARIO_FUNCIONAMENTO = {
  abre: 18,
  fecha: 23,
  descricao: "Todos os dias, das 18h às 23h",
} as const;

const TELEFONE_DIGITOS = "5561992465458";

export const CONTATO = {
  telefoneExibicao: "(61) 9 9246-5458",
  whatsappUrl: `https://wa.me/${TELEFONE_DIGITOS}`,
  instagram: "@nina_burguer61",
  instagramUrl: "https://instagram.com/nina_burguer61",
  endereco: "QNO 4 Conjunto L - 78, Ceilândia Norte — Setor O",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("QNO 4 Conjunto L 78, Ceilândia Norte, Brasília - DF"),
} as const;

/** Verdadeiro se a lanchonete está aberta no horário informado. */
export function lojaEstaAberta(agora: Date = new Date()): boolean {
  const hora = agora.getHours();
  return hora >= HORARIO_FUNCIONAMENTO.abre && hora < HORARIO_FUNCIONAMENTO.fecha;
}
