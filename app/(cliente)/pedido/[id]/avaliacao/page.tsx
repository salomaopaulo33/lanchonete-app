"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PaginaAvaliacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

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
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-secondary">Obrigado pela avaliação!</h1>
        <p className="text-muted-foreground">Seu feedback ajuda a lanchonete a melhorar.</p>
        <Button onClick={() => router.push("/cardapio")}>Voltar ao cardápio</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-secondary">Como foi seu atendimento?</h1>

      <div className="flex justify-center gap-2 text-3xl">
        {[1, 2, 3, 4, 5].map((valor) => (
          <button
            key={valor}
            type="button"
            aria-label={`${valor} estrela${valor > 1 ? "s" : ""}`}
            onClick={() => setNota(valor)}
            className={valor <= nota ? "text-primary" : "text-muted-foreground/40"}
          >
            ★
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Conte como foi (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Button className="w-full" size="lg" onClick={enviarAvaliacao} disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar avaliação"}
      </Button>
    </div>
  );
}
