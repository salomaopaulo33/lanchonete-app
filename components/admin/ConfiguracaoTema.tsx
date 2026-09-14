"use client";

import { useState } from "react";
import { Loader2, Paintbrush, RotateCcw, Save } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { themeTokens } from "@/lib/theme/tokens";

const CAMPOS: { chave: string; rotulo: string; dica: string }[] = [
  { chave: "primary", rotulo: "Cor principal", dica: "Botões, preços e destaques" },
  { chave: "secondary", rotulo: "Cor secundária", dica: "Títulos e cabeçalhos" },
  { chave: "background", rotulo: "Cor de fundo", dica: "Fundo de todas as telas" },
  { chave: "foreground", rotulo: "Cor do texto", dica: "Texto principal" },
];

/** Paleta oficial (lib/theme/tokens.ts), usada pelo botão "Restaurar". */
const PALETA_OFICIAL: Record<string, string> = {
  primary: themeTokens.primary,
  secondary: themeTokens.secondary,
  background: themeTokens.background,
  foreground: themeTokens.foreground,
};

export function ConfiguracaoTema({ temaInicial }: { temaInicial: Record<string, string> }) {
  const [cores, setCores] = useState<Record<string, string>>(temaInicial);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const ehOficial = CAMPOS.every(
    (c) => (cores[c.chave] ?? "").toLowerCase() === PALETA_OFICIAL[c.chave].toLowerCase(),
  );

  async function salvar(paleta: Record<string, string>) {
    setSalvando(true);
    setMensagem(null);
    try {
      const resposta = await fetch("/api/tema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paleta),
      });
      if (!resposta.ok) throw new Error();
      setCores(paleta);
      setMensagem({
        tipo: "ok",
        texto: "Cores salvas! Atualize a página para ver o resultado em todo o site.",
      });
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível salvar as cores agora. Tente de novo." });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <Card>
        <CardContent className="space-y-5 pt-6">
          {CAMPOS.map((campo) => (
            <div key={campo.chave} className="flex items-center gap-4">
              <label
                htmlFor={campo.chave}
                className="relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-foreground/15"
                style={{ backgroundColor: cores[campo.chave] ?? PALETA_OFICIAL[campo.chave] }}
              >
                <Input
                  id={campo.chave}
                  type="color"
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  value={cores[campo.chave] ?? PALETA_OFICIAL[campo.chave]}
                  onChange={(e) => setCores((atual) => ({ ...atual, [campo.chave]: e.target.value }))}
                />
              </label>
              <div className="min-w-0 flex-1">
                <Label htmlFor={campo.chave}>{campo.rotulo}</Label>
                <p className="text-xs text-muted-foreground">{campo.dica}</p>
              </div>
              <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs uppercase">
                {cores[campo.chave] ?? PALETA_OFICIAL[campo.chave]}
              </code>
            </div>
          ))}

          {mensagem && (
            <p
              role="status"
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                mensagem.tipo === "ok"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {mensagem.texto}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={() => salvar(cores)} disabled={salvando}>
              {salvando ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
              {salvando ? "Salvando…" : "Salvar cores"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => salvar(PALETA_OFICIAL)}
              disabled={salvando || ehOficial}
              title={ehOficial ? "A paleta oficial já está aplicada" : undefined}
            >
              <RotateCcw data-icon="inline-start" />
              Restaurar paleta oficial
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prévia ao vivo das cores escolhidas. */}
      <div
        className="flex flex-col gap-3 rounded-2xl border border-border p-4"
        style={{
          backgroundColor: cores.background ?? PALETA_OFICIAL.background,
          color: cores.foreground ?? PALETA_OFICIAL.foreground,
        }}
      >
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-70">
          <Paintbrush className="size-3.5" />
          Prévia
        </p>
        <p
          className="titulo-display text-3xl"
          style={{ color: cores.secondary ?? PALETA_OFICIAL.secondary }}
        >
          Nina Burguer
        </p>
        <p className="text-sm opacity-80">Hambúrguer artesanal, feito na hora.</p>
        <span
          className="mt-auto inline-flex h-10 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: cores.primary ?? PALETA_OFICIAL.primary, color: "#fff" }}
        >
          Ver cardápio
        </span>
      </div>
    </div>
  );
}
