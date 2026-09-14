"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bike,
  Check,
  ChefHat,
  CircleCheck,
  CreditCard,
  Inbox,
  PackageCheck,
  Star,
  UtensilsCrossed,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { createClient } from "@/lib/supabase/client";
import { codigoCurtoPedido, formatarMoeda } from "@/lib/formatacao";
import type { StatusPedido as StatusPedidoTipo } from "@/lib/domain/pedido";

const TEXTO_STATUS: Record<StatusPedidoTipo, string> = {
  recebido: "Recebemos seu pedido!",
  em_preparo: "Seu pedido está sendo preparado",
  pronto: "Seu pedido está pronto",
  saiu_para_entrega: "Seu pedido saiu para entrega",
  entregue: "Pedido entregue",
  retirado: "Pedido retirado",
  avaliado: "Pedido concluído",
  cancelado: "Pedido cancelado",
};

const DETALHE_STATUS: Record<StatusPedidoTipo, string> = {
  recebido: "A cozinha já foi avisada e vai começar em instantes.",
  em_preparo: "Chapa quente! Estamos montando tudo com carinho.",
  pronto: "Tudo pronto e embalado.",
  saiu_para_entrega: "O entregador está a caminho do seu endereço.",
  entregue: "Bom apetite! Conta pra gente como foi.",
  retirado: "Bom apetite! Conta pra gente como foi.",
  avaliado: "Obrigado pela avaliação. Até a próxima!",
  cancelado: "Se precisar, fale com a gente pelo WhatsApp.",
};

interface Etapa {
  status: StatusPedidoTipo;
  titulo: string;
  Icone: LucideIcon;
}

const ETAPAS_RETIRADA: Etapa[] = [
  { status: "recebido", titulo: "Recebido", Icone: Inbox },
  { status: "em_preparo", titulo: "Em preparo", Icone: ChefHat },
  { status: "pronto", titulo: "Pronto para retirar", Icone: PackageCheck },
  { status: "retirado", titulo: "Retirado", Icone: CircleCheck },
];

const ETAPAS_ENTREGA: Etapa[] = [
  { status: "recebido", titulo: "Recebido", Icone: Inbox },
  { status: "em_preparo", titulo: "Em preparo", Icone: ChefHat },
  { status: "pronto", titulo: "Pronto", Icone: PackageCheck },
  { status: "saiu_para_entrega", titulo: "Saiu para entrega", Icone: Bike },
  { status: "entregue", titulo: "Entregue", Icone: CircleCheck },
];

const NOME_FORMA_PAGAMENTO: Record<string, string> = {
  pix: "Pix",
  cartao: "Cartão",
  dinheiro_na_entrega: "Dinheiro na entrega",
};

export interface ItemDoPedido {
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface PedidoDetalhado {
  id: string;
  status: StatusPedidoTipo;
  valor_total: number;
  taxa_entrega: number;
  tipo_entrega: "retirada" | "entrega";
  endereco_entrega: string | null;
  pagamento: { status: string; forma_pagamento: string } | null;
  itens: ItemDoPedido[];
}

export function StatusPedido({ pedidoInicial }: { pedidoInicial: PedidoDetalhado }) {
  const [pedido, setPedido] = useState(pedidoInicial);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel(`pedido-${pedido.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedido", filter: `id=eq.${pedido.id}` },
        (payload) => {
          const novoPedido = payload.new as { status: StatusPedidoTipo };
          setPedido((atual) => ({ ...atual, status: novoPedido.status }));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pagamento", filter: `pedido_id=eq.${pedido.id}` },
        (payload) => {
          const novoPagamento = payload.new as { status: string; forma_pagamento: string };
          setPedido((atual) => ({ ...atual, pagamento: novoPagamento }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [pedido.id]);

  const etapas = pedido.tipo_entrega === "entrega" ? ETAPAS_ENTREGA : ETAPAS_RETIRADA;
  const cancelado = pedido.status === "cancelado";
  const concluido = pedido.status === "avaliado";
  // Índice da etapa atual; "avaliado" conta como a última etapa concluída.
  const indiceAtual = concluido
    ? etapas.length - 1
    : etapas.findIndex((e) => e.status === pedido.status);

  const podeAvaliar = pedido.status === "entregue" || pedido.status === "retirado";
  const pago = pedido.pagamento?.status === "pago";
  const precisaPagar = !cancelado && (!pedido.pagamento || pedido.pagamento.status === "pendente");
  const subtotal = Number(pedido.valor_total) - Number(pedido.taxa_entrega ?? 0);

  return (
    <div className="space-y-5 animate-subir">
      {/* ---------- Cabeçalho do pedido ---------- */}
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card p-5",
          cancelado ? "border-destructive/40" : "border-secondary/30",
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 size-48 rounded-full blur-3xl",
            cancelado ? "bg-destructive/20" : "bg-primary/25",
          )}
        />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Pedido <span className="text-foreground">#{codigoCurtoPedido(pedido.id)}</span>
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                pago
                  ? "border-success/40 bg-success/10 text-success"
                  : cancelado
                    ? "border-border bg-muted text-muted-foreground"
                    : "border-warning/40 bg-warning/10 text-warning",
              )}
            >
              <CreditCard className="size-3.5" />
              {pago
                ? `Pago · ${NOME_FORMA_PAGAMENTO[pedido.pagamento?.forma_pagamento ?? ""] ?? ""}`
                : cancelado
                  ? "Sem cobrança"
                  : "Aguardando pagamento"}
            </span>
          </div>

          <h2
            className={cn(
              "titulo-display mt-3 text-4xl leading-none",
              cancelado ? "text-destructive" : "text-secondary",
            )}
          >
            {TEXTO_STATUS[pedido.status]}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{DETALHE_STATUS[pedido.status]}</p>
        </div>
      </section>

      {/* ---------- Linha do tempo ---------- */}
      {cancelado ? (
        <section className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <XCircle className="size-5 shrink-0 text-destructive" />
          <p className="text-muted-foreground">
            Este pedido foi cancelado. Você pode fazer um novo pedido pelo cardápio.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <ol className="relative space-y-0">
            {etapas.map((etapa, indice) => {
              const feita = indice < indiceAtual || concluido;
              const atual = indice === indiceAtual && !concluido;
              const ultima = indice === etapas.length - 1;
              return (
                <li key={etapa.status} className="relative flex gap-4 pb-6 last:pb-0">
                  {!ultima && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-0.5 rounded-full",
                        feita ? "bg-secondary" : "bg-border",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      feita && "border-secondary bg-secondary text-secondary-foreground",
                      atual && "animate-pulsar-anel border-primary bg-primary text-primary-foreground",
                      !feita && !atual && "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {feita ? <Check className="size-5" strokeWidth={3} /> : <etapa.Icone className="size-5" />}
                  </span>
                  <div className="pt-2">
                    <p
                      className={cn(
                        "font-semibold leading-tight",
                        atual && "text-primary",
                        !feita && !atual && "text-muted-foreground",
                      )}
                    >
                      {etapa.titulo}
                    </p>
                    {atual && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Esta tela atualiza sozinha quando o pedido avançar.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* ---------- Ações ---------- */}
      <div className="space-y-3">
        {precisaPagar && (
          <Link
            href={`/pedido/${pedido.id}/pagamento`}
            className="brilho-primario flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <CreditCard className="size-5" />
            Pagar agora · {formatarMoeda(Number(pedido.valor_total))}
          </Link>
        )}
        {podeAvaliar && (
          <Link
            href={`/pedido/${pedido.id}/avaliacao`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-secondary/50 bg-secondary/10 font-semibold text-secondary transition-colors hover:bg-secondary/20"
          >
            <Star className="size-5" />
            Avaliar atendimento
          </Link>
        )}
      </div>

      {/* ---------- Resumo ---------- */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 text-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Resumo</h3>
        {pedido.itens.length > 0 && (
          <ul className="space-y-2">
            {pedido.itens.map((item, indice) => (
              <li key={`${item.nome}-${indice}`} className="flex justify-between gap-3">
                <span>
                  <span className="mr-2 inline-block min-w-6 rounded-md bg-muted px-1.5 text-center text-xs font-bold tabular-nums">
                    {item.quantidade}x
                  </span>
                  {item.nome}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatarMoeda(item.precoUnitario * item.quantidade)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className={cn("space-y-1 text-muted-foreground", pedido.itens.length > 0 && "mt-3 border-t border-border pt-3")}>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatarMoeda(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              {pedido.tipo_entrega === "entrega" ? "Taxa de entrega" : "Retirada no local"}
            </span>
            <span className="tabular-nums">
              {Number(pedido.taxa_entrega) > 0 ? formatarMoeda(Number(pedido.taxa_entrega)) : "Grátis"}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="titulo-display text-3xl text-secondary tabular-nums">
            {formatarMoeda(Number(pedido.valor_total))}
          </span>
        </div>
        {pedido.tipo_entrega === "entrega" && pedido.endereco_entrega && (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Bike className="mt-0.5 size-3.5 shrink-0" />
            {pedido.endereco_entrega}
          </p>
        )}
      </section>

      <Link
        href="/cardapio"
        className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <UtensilsCrossed className="size-4" />
        Fazer outro pedido
      </Link>
    </div>
  );
}
