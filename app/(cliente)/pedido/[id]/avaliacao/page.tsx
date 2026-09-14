"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CircleCheck, Loader2, Send, Star } from "lucide-react";
import { cn } from "cn";
import { Textarea } from "@/components/ui/textarea";

const ROTULOS_NOTA = ["", "Ruim", "Podia melhorar", "Bom", "Muito bom", "Excelente!"];

export default function PaginaAvaliacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [nota, setNota] = useState(0);
  const [notaPrevia, setNotaPrevia] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const notaExibida = notaPrevia || nota;

  async function enviarAvaliacao() {
    if (nota === 0) {
      setErro("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/orders/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota, comentario }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar sua avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="animate-surgir py-16 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-success/15 text-success">
          <CircleCheck className="size-10" />
        </span>
        <h1 className="titulo-display mt-6 text-5xl">
          Obrigado pela <span className="texto-dourado">avaliação</span>!
        </h1>
        <p className="mt-2 text-muted-foreground">Seu feedback ajuda a Nina Burguer a melhorar sempre.</p>
        <button
          type="button"
          onClick={() => router.push("/cardapio")}
          className="brilho-primario mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
        >
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-6 animate-subir"
      onSubmit={(e) => {
        e.preventDefault();
        void enviarAvaliacao();
      }}
    >
      <div>
        <Link
          href={`/pedido/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Voltar ao pedido
        </Link>
        <h1 className="titulo-display mt-2 text-5xl">
          Como foi seu <span className="texto-dourado">atendimento</span>?
        </h1>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
        <div
          role="radiogroup"
          aria-label="Nota de 1 a 5 estrelas"
          className="flex justify-center gap-1.5"
          onMouseLeave={() => setNotaPrevia(0)}
        >
          {[1, 2, 3, 4, 5].map((valor) => {
            const ativa = valor <= notaExibida;
            return (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={nota === valor}
                aria-label={`${valor} ${valor > 1 ? "estrelas" : "estrela"}`}
                onClick={() => setNota(valor)}
                onMouseEnter={() => setNotaPrevia(valor)}
                onFocus={() => setNotaPrevia(valor)}
                onBlur={() => setNotaPrevia(0)}
                className={cn(
                  "rounded-full p-1.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary",
                  ativa ? "text-primary" : "text-muted-foreground/40",
                )}
              >
                <Star
                  className={cn("size-10 transition-all", ativa && "drop-shadow-[0_0_12px_var(--primary)]")}
                  fill={ativa ? "currentColor" : "none"}
                />
              </button>
            );
          })}
        </div>
        <p className="mt-3 h-6 text-sm font-medium text-secondary" aria-live="polite">
          {ROTULOS_NOTA[notaExibida] || "Toque nas estrelas para dar a nota"}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="comentario" className="text-sm font-medium">
          Quer contar mais? <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Textarea
          id="comentario"
          placeholder="O lanche chegou quentinho? O entregador foi atencioso?"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="min-h-28 rounded-xl bg-card"
        />
      </div>

      {erro && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="brilho-primario flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
      >
        {enviando ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
        {enviando ? "Enviando…" : "Enviar avaliação"}
      </button>
    </form>
  );
}
