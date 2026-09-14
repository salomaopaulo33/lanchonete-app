"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bike, ChevronLeft, Loader2, MapPin, Phone, ShoppingBag, Store, User } from "lucide-react";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart/CartContext";
import { TAXA_ENTREGA_PADRAO } from "@/lib/domain/pedido";
import { formatarMoeda, formatarTelefone } from "@/lib/formatacao";
import { FotoItem } from "@/components/cardapio/FotoItem";
import { ControleQuantidade } from "@/components/carrinho/ControleQuantidade";

type TipoEntrega = "retirada" | "entrega";

const OPCOES_ENTREGA: { valor: TipoEntrega; titulo: string; descricao: string; Icone: typeof Store }[] = [
  { valor: "retirada", titulo: "Retirar no local", descricao: "Sem taxa", Icone: Store },
  { valor: "entrega", titulo: "Entregar", descricao: `Taxa ${formatarMoeda(TAXA_ENTREGA_PADRAO)}`, Icone: Bike },
];

export default function NovoPedidoPage() {
  const router = useRouter();
  const { itens, valorTotal, alterarQuantidade, limparCarrinho } = useCart();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>("retirada");
  const [endereco, setEndereco] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const taxaEntrega = tipoEntrega === "entrega" ? TAXA_ENTREGA_PADRAO : 0;
  const total = valorTotal + taxaEntrega;

  async function enviarPedido() {
    setErro(null);

    if (!nome.trim() || !telefone.trim()) {
      setErro("Preencha seu nome e telefone para continuar.");
      return;
    }
    if (tipoEntrega === "entrega" && !endereco.trim()) {
      setErro("Informe o endereço de entrega.");
      return;
    }
    if (itens.length === 0) {
      setErro("Seu carrinho está vazio. Volte ao cardápio e escolha algo gostoso!");
      return;
    }

    setEnviando(true);
    try {
      const respostaCliente = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), telefone }),
      });
      const { cliente, erro: erroCliente } = await respostaCliente.json();
      if (!respostaCliente.ok) throw new Error(erroCliente);

      const respostaPedido = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          tipoEntrega,
          enderecoEntrega: tipoEntrega === "entrega" ? endereco.trim() : undefined,
          itens: itens.map((i) => ({ itemCardapioId: i.item.id, quantidade: i.quantidade })),
        }),
      });
      const { pedido, erro: erroPedido } = await respostaPedido.json();
      if (!respostaPedido.ok) throw new Error(erroPedido);

      setEnviado(true);
      limparCarrinho();
      router.push(`/pedido/${pedido.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar o pedido. Tente de novo.");
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="animate-surgir py-20 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="titulo-display mt-4 text-4xl text-secondary">Pedido enviado!</p>
        <p className="mt-1 text-muted-foreground">Levando você para o acompanhamento…</p>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="animate-surgir py-16 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full border border-dashed border-border text-muted-foreground">
          <ShoppingBag className="size-8" />
        </span>
        <h1 className="titulo-display mt-6 text-4xl">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">Escolha algo gostoso no cardápio para começar.</p>
        <Link
          href="/cardapio"
          className="brilho-primario mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
        >
          Ver cardápio
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        void enviarPedido();
      }}
    >
      <div className="animate-subir">
        <Link
          href="/cardapio"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Voltar ao cardápio
        </Link>
        <h1 className="titulo-display mt-2 text-5xl">
          Finalizar <span className="texto-dourado">pedido</span>
        </h1>
      </div>

      {/* ---------- Itens ---------- */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Seus itens</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border/60 bg-card">
          {itens.map(({ item, quantidade }) => (
            <li key={item.id} className="flex items-center gap-3 p-3">
              <FotoItem item={item} className="size-14 shrink-0 rounded-lg" sizes="56px" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.nome}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {formatarMoeda(item.preco)} cada
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-semibold tabular-nums">{formatarMoeda(item.preco * quantidade)}</span>
                <ControleQuantidade
                  quantidade={quantidade}
                  nomeItem={item.nome}
                  onAlterar={(q) => alterarQuantidade(item.id, q)}
                  className="h-8"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Entrega ---------- */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Como você quer receber?
        </h2>
        <div role="radiogroup" className="grid grid-cols-2 gap-3">
          {OPCOES_ENTREGA.map(({ valor, titulo, descricao, Icone }) => {
            const ativo = tipoEntrega === valor;
            return (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => setTipoEntrega(valor)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                  ativo
                    ? "border-primary bg-primary/10 shadow-[0_10px_30px_-18px_var(--primary)]"
                    : "border-border bg-card hover:border-secondary/50",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    ativo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icone className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-tight">{titulo}</span>
                  <span className="block text-xs text-muted-foreground">{descricao}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- Dados ---------- */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Seus dados</h2>

        <div className="space-y-1.5">
          <Label htmlFor="nome">Seu nome</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="nome"
              autoComplete="name"
              placeholder="Como devemos te chamar?"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-12 rounded-xl bg-card pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone com WhatsApp</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(61) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              className="h-12 rounded-xl bg-card pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">Avisamos por WhatsApp quando o pedido avançar.</p>
        </div>

        {tipoEntrega === "entrega" && (
          <div className="space-y-1.5 animate-surgir">
            <Label htmlFor="endereco">Endereço de entrega</Label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="endereco"
                autoComplete="street-address"
                placeholder="Rua, número, quadra e ponto de referência"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="h-12 rounded-xl bg-card pl-10"
              />
            </div>
          </div>
        )}
      </section>

      {/* ---------- Resumo ---------- */}
      <section className="rounded-2xl border border-secondary/30 bg-card p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatarMoeda(valorTotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-muted-foreground">
          <span>Taxa de entrega</span>
          <span className="tabular-nums">{taxaEntrega > 0 ? formatarMoeda(taxaEntrega) : "Grátis"}</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="titulo-display text-3xl text-secondary tabular-nums">{formatarMoeda(total)}</span>
        </div>
      </section>

      {erro && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      {/* ---------- Botão fixo ---------- */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto max-w-2xl">
          <button
            type="submit"
            disabled={enviando}
            className="brilho-primario flex h-14 w-full items-center justify-between rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-70"
          >
            <span className="flex items-center gap-2">
              {enviando ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
              {enviando ? "Enviando pedido…" : "Confirmar pedido"}
            </span>
            <span className="text-lg tabular-nums">{formatarMoeda(total)}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
