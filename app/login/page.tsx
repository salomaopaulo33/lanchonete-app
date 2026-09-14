"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, Lock, LogIn, Mail } from "lucide-react";
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
    <div className="fundo-brilho flex min-h-screen flex-col px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Voltar ao site
      </Link>

      <div className="flex flex-1 items-center justify-center">
        <form
          className="w-full max-w-sm animate-subir"
          onSubmit={(e) => {
            e.preventDefault();
            void entrar();
          }}
        >
          <div className="mb-6 text-center">
            <div className="anel-dourado mx-auto w-fit">
              <Image
                src="/logo-nina-burguer.jpeg"
                alt="Nina Burguer"
                width={88}
                height={88}
                className="block rounded-full"
                priority
              />
            </div>
            <h1 className="titulo-display mt-5 text-4xl">
              Acesso da <span className="texto-dourado">equipe</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Painel de pedidos, entregas e cardápio.</p>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 rounded-xl pl-10"
                />
              </div>
            </div>

            {erro && (
              <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={entrando}
              className="brilho-primario flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
            >
              {entrando ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
              {entrando ? "Entrando…" : "Entrar"}
            </button>
          </div>
        </form>
      </div>
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
