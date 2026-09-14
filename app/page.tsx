"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Clock,
  CreditCard,
  ExternalLink,
  Flame,
  Lock,
  MapPin,
  Phone,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { IconeInstagram } from "@/components/layout/IconeInstagram";
import { CONTATO, HORARIO_FUNCIONAMENTO, lojaEstaAberta } from "@/lib/loja/info";

const PASSOS = [
  {
    Icone: UtensilsCrossed,
    titulo: "Escolha",
    texto: "Monte seu pedido direto no cardápio, sem cadastro.",
  },
  {
    Icone: CreditCard,
    titulo: "Pague",
    texto: "Pix na hora, cartão ou dinheiro na entrega.",
  },
  {
    Icone: Bike,
    titulo: "Acompanhe",
    texto: "Veja cada etapa do pedido em tempo real.",
  },
];

type EstadoInicial = "carregando" | "redirecionar" | "mostrar";

/** Sem fonte externa que mude: os snapshots abaixo só dependem da URL e do relógio. */
function semAssinatura() {
  return () => {};
}

function lerEstadoInicialNoNavegador(): EstadoInicial {
  const hash = window.location.hash;
  return hash.includes("type=recovery") || hash.includes("type=invite") ? "redirecionar" : "mostrar";
}

/**
 * Página inicial institucional. Também funciona como destino padrão dos
 * links de convite/recuperação de senha do Supabase (que só permitem
 * redirecionar para a URL "raiz" do site por padrão) — se detectar um
 * token de recuperação na URL, encaminha para /definir-senha preservando
 * o token; caso contrário, mostra a home normalmente.
 */
export default function Home() {
  const router = useRouter();
  // No servidor ainda não sabemos se a URL traz um token de recuperação;
  // só decidimos o que mostrar depois de ler o hash no navegador.
  const estadoInicial = useSyncExternalStore(semAssinatura, lerEstadoInicialNoNavegador, () => "carregando");
  const aberta = useSyncExternalStore(semAssinatura, lojaEstaAberta, () => false);
  const estado = { aberta };

  useEffect(() => {
    if (estadoInicial === "redirecionar") {
      router.replace(`/definir-senha${window.location.hash}`);
    }
  }, [estadoInicial, router]);

  if (estadoInicial !== "mostrar") {
    return null;
  }

  return (
    <div className="fundo-brilho min-h-screen">
      <main className="mx-auto max-w-2xl px-4 pb-12 pt-10 sm:pt-16">
        {/* ---------- Hero ---------- */}
        <section className="animate-subir text-center">
          <div className="anel-dourado mx-auto w-fit animate-flutuar">
            <Image
              src="/logo-nina-burguer.jpeg"
              alt="Nina Burguer"
              width={140}
              height={140}
              className="block size-32 rounded-full sm:size-36"
              priority
            />
          </div>

          <p
            className={
              estado.aberta
                ? "mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
                : "mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground"
            }
          >
            <span className="relative flex size-2">
              {estado.aberta && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              )}
              <span
                className={
                  estado.aberta
                    ? "relative inline-flex size-2 rounded-full bg-success"
                    : "relative inline-flex size-2 rounded-full bg-muted-foreground"
                }
              />
            </span>
            {estado.aberta
              ? `Aberto agora · até ${HORARIO_FUNCIONAMENTO.fecha}h`
              : `Fechado agora · abre às ${HORARIO_FUNCIONAMENTO.abre}h`}
          </p>

          <h1 className="titulo-display mt-5 text-[3.4rem] leading-[0.92] sm:text-7xl">
            Hambúrguer <span className="texto-dourado-brilho">artesanal</span>,
            <br />
            feito na hora.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-balance text-muted-foreground">
            Pão brioche, blends selecionados e molhos de receita própria. Peça pelo site e
            acompanhe seu pedido até chegar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/cardapio"
              className="brilho-primario inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Ver cardápio e pedir
              <ArrowRight className="size-5" />
            </Link>
            <a
              href={CONTATO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-base font-medium transition-colors hover:border-secondary/50 hover:text-secondary"
            >
              <Phone className="size-4" />
              Falar no WhatsApp
            </a>
          </div>
        </section>

        {/* ---------- Como funciona ---------- */}
        <section className="mt-16 animate-subir" style={{ animationDelay: "120ms" }}>
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Como funciona</h2>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {PASSOS.map(({ Icone, titulo, texto }, indice) => (
              <li
                key={titulo}
                className="relative flex gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:flex-col sm:gap-3"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icone className="size-5" />
                </span>
                <div>
                  <p className="titulo-display text-2xl text-secondary">
                    <span className="mr-2 text-muted-foreground">0{indice + 1}</span>
                    {titulo}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Sobre / Contato / Horário ---------- */}
        <section className="mt-14 grid gap-3 sm:grid-cols-2 animate-subir" style={{ animationDelay: "200ms" }}>
          <article className="rounded-2xl border border-border/60 bg-card p-5 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-primary" />
              <h2 className="titulo-display text-3xl text-secondary">Sobre a Nina</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              A Nina Burguer nasceu da paixão por hambúrgueres artesanais. Cada lanche é montado
              na hora, com pão brioche, blends selecionados e molhos especiais de receita própria.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Peça pelo cardápio, acompanhe seu pedido em tempo real e avalie o atendimento depois
              de receber.
            </p>
          </article>

          <article className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="titulo-display text-3xl text-secondary">Contato</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <a
                  href={CONTATO.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 hover:text-secondary"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    {CONTATO.endereco}
                    <ExternalLink className="ml-1 inline size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={CONTATO.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-secondary"
                >
                  <Phone className="size-4 shrink-0 text-primary" />
                  {CONTATO.telefoneExibicao}
                </a>
              </li>
              <li>
                <a
                  href={CONTATO.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-secondary"
                >
                  <IconeInstagram className="size-4 shrink-0 text-primary" />
                  {CONTATO.instagram}
                </a>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="titulo-display text-3xl text-secondary">Horário</h2>
            <div className="mt-3 flex items-start gap-3 text-sm">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{HORARIO_FUNCIONAMENTO.descricao}</p>
                <p className="mt-1 text-muted-foreground">
                  {estado.aberta
                    ? "Estamos abertos. Bora pedir?"
                    : `Abrimos às ${HORARIO_FUNCIONAMENTO.abre}h. Deixe seu pedido pronto no carrinho!`}
                </p>
              </div>
            </div>
          </article>
        </section>

        <footer className="mt-14 flex flex-col items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Nina Burguer · Ceilândia Norte, DF</p>
          <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <Lock className="size-3" />
            Acesso da equipe
          </Link>
        </footer>
      </main>
    </div>
  );
}
