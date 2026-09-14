"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type FormaPagamento = "pix" | "cartao" | "dinheiro_na_entrega";

export default function PaginaPagamento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [processando, setProcessando] = useState<FormaPagamento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [dadosPix, setDadosPix] = useState<{ qrCodeBase64?: string; copiaECola?: string } | null>(
    null,
  );

  async function pagar(formaPagamento: FormaPagamento) {
    setErro(null);
    setProcessando(formaPagamento);
    try {
      const resposta = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: id, formaPagamento }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);

      if (formaPagamento === "pix" && dados.copiaECola) {
        setDadosPix({ qrCodeBase64: dados.qrCodeBase64, copiaECola: dados.copiaECola });
        return;
      }
      if (formaPagamento === "cartao" && dados.checkoutUrl) {
        window.location.href = dados.checkoutUrl;
        return;
      }

      router.push(`/pedido/${id}`);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "O pagamento não foi aprovado. Tente novamente ou escolha outra forma de pagamento.",
      );
    } finally {
      setProcessando(null);
    }
  }

  if (dadosPix?.copiaECola) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-secondary">Pague com Pix</h1>
        <p className="text-sm text-muted-foreground">
          Abra o app do seu banco, escaneie o QR code ou use o código copia-e-cola abaixo.
        </p>
        {dadosPix.qrCodeBase64 && (
          <img
            src={`data:image/png;base64,${dadosPix.qrCodeBase64}`}
            alt="QR code Pix"
            className="mx-auto h-56 w-56"
          />
        )}
        <Card>
          <CardContent className="break-all pt-6 text-xs">{dadosPix.copiaECola}</CardContent>
        </Card>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigator.clipboard.writeText(dadosPix.copiaECola ?? "")}
        >
          Copiar código
        </Button>
        <Button className="w-full" onClick={() => router.push(`/pedido/${id}`)}>
          Já paguei
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-secondary">Como você quer pagar?</h1>

      <Button className="w-full" size="lg" disabled={!!processando} onClick={() => pagar("pix")}>
        {processando === "pix" ? "Gerando Pix..." : "Pix"}
      </Button>
      <Button
        className="w-full"
        size="lg"
        variant="outline"
        disabled={!!processando}
        onClick={() => pagar("cartao")}
      >
        {processando === "cartao" ? "Abrindo pagamento..." : "Cartão de crédito/débito"}
      </Button>
      <Button
        className="w-full"
        size="lg"
        variant="outline"
        disabled={!!processando}
        onClick={() => pagar("dinheiro_na_entrega")}
      >
        Dinheiro na entrega
      </Button>

      {erro && (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{erro}</p>
          <p className="text-sm text-muted-foreground">Escolha outra forma de pagamento acima.</p>
        </div>
      )}
    </div>
  );
}
