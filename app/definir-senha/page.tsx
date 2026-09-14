"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

/**
 * Página para onde o link de convite/recuperação de senha do Supabase
 * redireciona. O próprio cliente do Supabase detecta o token na URL e cria
 * uma sessão temporária; aqui só pedimos a nova senha e a confirmamos.
 */
export default function PaginaDefinirSenha() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setPronto(!!data.session);
      if (!data.session) {
        setErro("Este link expirou ou já foi usado. Peça um novo convite.");
      }
    });
  }, []);

  async function salvarSenha() {
    setErro(null);
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
      setErro("Não foi possível salvar a senha. Tente novamente.");
      return;
    }
    router.push("/admin/recebimentos");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center px-4">
      <Card className="w-full">
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-xl font-bold text-secondary">Defina sua senha</h1>

          {!pronto && erro && <p className="text-sm text-destructive">{erro}</p>}

          {pronto && (
            <>
              <div>
                <Label htmlFor="senha">Nova senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmar-senha">Confirme a senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
              </div>
              {erro && <p className="text-sm text-destructive">{erro}</p>}
              <Button className="w-full" onClick={salvarSenha} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar senha e entrar"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
