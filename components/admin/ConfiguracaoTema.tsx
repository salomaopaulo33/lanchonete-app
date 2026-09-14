"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CAMPOS: { chave: string; rotulo: string }[] = [
  { chave: "primary", rotulo: "Cor principal (botões, destaques)" },
  { chave: "secondary", rotulo: "Cor secundária (cabeçalhos)" },
  { chave: "background", rotulo: "Cor de fundo" },
  { chave: "foreground", rotulo: "Cor do texto" },
];

export function ConfiguracaoTema({ temaInicial }: { temaInicial: Record<string, string> }) {
  const [cores, setCores] = useState(temaInicial);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function salvar() {
    setSalvando(true);
    setMensagem(null);
    try {
      const resposta = await fetch("/api/tema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cores),
      });
      if (!resposta.ok) throw new Error();
      setMensagem("Cores salvas! Atualize a página para ver o resultado em todo o site.");
    } catch {
      setMensagem("Não foi possível salvar as cores agora. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {CAMPOS.map((campo) => (
          <div key={campo.chave} className="flex items-center gap-3">
            <Label htmlFor={campo.chave} className="w-56 shrink-0">
              {campo.rotulo}
            </Label>
            <Input
              id={campo.chave}
              type="color"
              className="h-10 w-16 p-1"
              value={cores[campo.chave] ?? "#000000"}
              onChange={(e) => setCores((atual) => ({ ...atual, [campo.chave]: e.target.value }))}
            />
            <span className="text-sm text-muted-foreground">{cores[campo.chave]}</span>
          </div>
        ))}

        {mensagem && <p className="text-sm">{mensagem}</p>}

        <Button onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar cores"}
        </Button>
      </CardContent>
    </Card>
  );
}
