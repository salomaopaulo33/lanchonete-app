"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronLeft,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

type FormaPagamento = "pix" | "cartao" | "dinheiro_na_entrega";

const OPCOES: {
  valor: FormaPagamento;
  titulo: string;
  descricao: string;
  destaque?: string;
  carregando: string;
  Icone: LucideIcon;
}[] = [
  {
    valor: "pix",
    titulo: "Pix",
    descricao: "QR code ou copia e cola. Confirmação na hora.",
    destaque: "Mais rápido",
    carregando: "Gerando Pix…",
    Icone: QrCode,
  },
  {
    valor: "cartao",
    titulo: "Cartão de crédito ou débito",
    descricao: "Pagamento seguro pelo Mercado Pago.",
    carregando: "Abrindo pagamento…",
    Icone: CreditCard,
  },
  {
    valor: "dinheiro_na_entrega",
    titulo: "Dinheiro na entrega",
    descricao: "Pague ao receber ou retirar o pedido.",
    carregando: "Registrando…",
    Icone: Banknote,
  },
];

export default function PaginaPagamento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [processando, setProcessando] = useState<FormaPagamento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [dadosPix, setDadosPix] = useState<{ qrCodeBase64?: string; copiaECola?: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const temporizador = setTimeout(() => setCopiado(false), 2200);
    return () => clearTimeout(temporizador);
  }, [copiado]);

  async function pagar(formaPagamento: FormaPagamento) {
    setErro(null);
    setProcessando(formaPagamento);
    try {
      const resposta = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: id, formaPagamento }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);

      if (formaPagamento === "pix" && dados.copiaECola) {
        setDadosPix({ qrCodeBase64: dados.qrCodeBase64, copiaECola: dados.copiaECola });
        return;
      }
      if (formaPagamento === "cartao" && dados.checkoutUrl) {
        window.location.assign(dados.checkoutUrl);
        return;
      }

      router.push(`/pedido/${id}`);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "O pagamento não foi aprovado. Tente novamente ou escolha outra forma de pagamento.",
      );
    } finally {
      setProcessando(null);
    }
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(dadosPix?.copiaECola ?? "");
      setCopiado(true);
    } catch {
      setErro("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  if (dadosPix?.copiaECola) {
    return (
      <div className="space-y-5 animate-subir">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Pagamento</p>
          <h1 className="titulo-display mt-1 text-5xl">
            Pague com <span className="texto-dourado">Pix</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Abra o app do seu banco, escaneie o QR code ou use o código copia e cola.
          </p>
        </div>

        {dadosPix.qrCodeBase64 && (
          <div className="mx-auto w-fit rounded-3xl border border-secondary/40 bg-white p-4 shadow-[0_20px_60px_-20px_var(--secondary)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem base64 gerada na hora, sem otimização possível */}
            <img
              src={`data:image/png;base64,${dadosPix.qrCodeBase64}`}
              alt="QR code Pix"
              className="size-56 rounded-xl"
            />
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pix copia e cola
          </p>
          <p className="max-h-24 overflow-y-auto break-all font-mono text-xs leading-relaxed text-foreground/80">
            {dadosPix.copiaECola}
          </p>
          <button
            type="button"
            onClick={copiarCodigo}
            className={cn(
              "mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border font-semibold transition-all",
              copiado
                ? "border-success/50 bg-success/15 text-success"
                : "border-secondary/50 bg-secondary/10 text-secondary hover:bg-secondary/20",
            )}
          >
            {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copiado ? "Código copiado!" : "Copiar código"}
          </button>
        </div>

        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push(`/pedido/${id}`)}
          className="brilho-primario flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground"
        >
          Já paguei
          <ArrowRight className="size-5" />
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Assim que o banco confirmar, a tela de acompanhamento atualiza sozinha.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-subir">
      <div>
        <Link
          href={`/pedido/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Voltar ao pedido
        </Link>
        <h1 className="titulo-display mt-2 text-5xl">
          Como você quer <span className="texto-dourado">pagar</span>?
        </h1>
      </div>

      <ul className="space-y-3">
        {OPCOES.map(({ valor, titulo, descricao, destaque, carregando, Icone }) => {
          const emAndamento = processando === valor;
          return (
            <li key={valor}>
              <button
                type="button"
                disabled={!!processando}
                onClick={() => pagar(valor)}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-all disabled:pointer-events-none",
                  emAndamento
                    ? "border-primary bg-primary/10"
                    : "border-border/60 hover:border-primary/60 hover:bg-primary/5",
                  processando && !emAndamento && "opacity-50",
                )}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {emAndamento ? <Loader2 className="size-6 animate-spin" /> : <Icone className="size-6" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{emAndamento ? carregando : titulo}</span>
                    {destaque && !emAndamento && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                        {destaque}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{descricao}</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            </li>
          );
        })}
      </ul>

      {erro && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <p className="text-destructive">{erro}</p>
          <p className="mt-1 text-muted-foreground">Escolha outra forma de pagamento acima.</p>
        </div>
      )}
    </div>
  );
}
