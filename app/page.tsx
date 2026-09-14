"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Página inicial institucional. Também funciona como destino padrão dos
 * links de convite/recuperação de senha do Supabase (que só permitem
 * redirecionar para a URL "raiz" do site por padrão) — se detectar um
 * token de recuperação na URL, encaminha para /definir-senha preservando
 * o token; caso contrário, mostra a home normalmente.
 */
export default function Home() {
  const router = useRouter();
  const [redirecionando, setRedirecionando] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("type=invite")) {
      router.replace(`/definir-senha${hash}`);
      return;
    }
    setRedirecionando(false);
  }, [router]);

  if (redirecionando) {
    return null;
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-10 text-center">
      <Image
        src="/logo-nina-burguer.jpeg"
        alt="Nina Burguer"
        width={140}
        height={140}
        className="mx-auto rounded-full"
        priority
      />
      <h1 className="mt-6 text-3xl font-bold text-secondary">Nina Burguer</h1>
      <p className="mt-2 text-muted-foreground">
        Hambúrgueres artesanais feitos na hora, com ingredientes selecionados.
      </p>

      <Button render={<Link href="/cardapio" />} size="lg" className="mt-6 w-full">
        Ver cardápio e fazer pedido
      </Button>

      <Tabs defaultValue="sobre" className="mt-10 text-left">
        <TabsList className="mx-auto">
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="horario">Horário</TabsTrigger>
        </TabsList>

        <TabsContent value="sobre">
          <Card>
            <CardContent className="space-y-2 pt-6">
              <p>
                A Nina Burguer nasceu da paixão por hambúrgueres artesanais. Cada lanche é
                montado na hora, com pão brioche, blends selecionados e molhos especiais de
                receita própria.
              </p>
              <p className="text-sm text-muted-foreground">
                Peça pelo cardápio, acompanhe seu pedido em tempo real e avalie o atendimento
                depois de receber.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contato">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p>QNO 4 Conjunto L - 78, Ceilândia Norte — Setor &quot;O&quot;</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone / WhatsApp</p>
                <p>(61) 9.9246-5458</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instagram</p>
                <p>@nina_burguer61</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horario">
          <Card>
            <CardContent className="pt-6">
              <p>Todos os dias, das 18h às 23h.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
