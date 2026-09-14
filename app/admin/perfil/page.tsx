"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

/** Permite à equipe já logada trocar sua própria senha. */
export default function PaginaPerfil() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function trocarSenha() {
    setErro(null);
    setSucesso(false);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      setErro("Não foi possível trocar a senha. Tente novamente.");
      return;
    }
    setSenha("");
    setConfirmarSenha("");
    setSucesso(true);
  }

  return (
    <div className="max-w-sm space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Minha conta</h1>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold">Trocar senha</h2>
          <div>
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirmar-nova-senha">Confirme a nova senha</Label>
            <Input
              id="confirmar-nova-senha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          {sucesso && <p className="text-sm text-green-700">Senha alterada com sucesso!</p>}
          <Button onClick={trocarSenha} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
