"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function FormularioLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    setErro(null);
    setEntrando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setEntrando(false);

    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    router.push(searchParams.get("proximo") ?? "/admin/recebimentos");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center px-4">
      <Card className="w-full">
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-xl font-bold text-secondary">Acesso da equipe</h1>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Button className="w-full" onClick={entrar} disabled={entrando}>
            {entrando ? "Entrando..." : "Entrar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
