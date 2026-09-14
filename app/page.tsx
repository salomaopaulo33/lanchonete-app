"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Página inicial. Também funciona como destino padrão dos links de
 * convite/recuperação de senha do Supabase (que só permitem redirecionar
 * para a URL "raiz" do site por padrão) — se detectar um token de
 * recuperação na URL, encaminha para /definir-senha preservando o token;
 * caso contrário, segue para o cardápio normalmente.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("type=invite")) {
      router.replace(`/definir-senha${hash}`);
      return;
    }
    router.replace("/cardapio");
  }, [router]);

  return null;
}
