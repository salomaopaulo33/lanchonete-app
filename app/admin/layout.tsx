import Link from "next/link";

const LINKS = [
  { href: "/admin/recebimentos", label: "Recebimentos" },
  { href: "/admin/rotas", label: "Rotas de entrega" },
  { href: "/admin/avaliacoes", label: "Avaliações" },
  { href: "/admin/cardapio", label: "Cardápio" },
  { href: "/admin/configuracoes", label: "Configurações" },
  { href: "/admin/perfil", label: "Minha conta" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary text-secondary-foreground">
        <nav className="mx-auto flex max-w-4xl flex-wrap gap-4 px-4 py-3 text-sm">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
