import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Fonte display condensada, no espírito da tipografia do logo. */
const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nina Burguer",
    template: "%s · Nina Burguer",
  },
  description: "Hambúrguer artesanal feito na hora. Peça, pague com Pix ou cartão e acompanhe a entrega.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Lê a paleta de cores configurada em `configuracao_tema` (FR-014) e a
 * aplica por cima dos tokens padrão de app/globals.css, sem precisar
 * alterar nenhum componente quando a lanchonete enviar a paleta oficial.
 */
async function buscarSobrescritasDeTema() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("configuracao_tema").select("chave, valor");
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cores = await buscarSobrescritasDeTema();
  const variaveisCss = cores.map((c) => `--${c.chave.replaceAll("_", "-")}: ${c.valor};`).join(" ");

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {variaveisCss && <style>{`:root { ${variaveisCss} }`}</style>}
        {children}
      </body>
    </html>
  );
}
