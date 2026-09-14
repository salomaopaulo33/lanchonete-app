"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Receipt,
  Route,
  Settings,
  User,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

const LINKS: { href: string; label: string; Icone: LucideIcon }[] = [
  { href: "/admin/recebimentos", label: "Recebimentos", Icone: Receipt },
  { href: "/admin/rotas", label: "Rotas de entrega", Icone: Route },
  { href: "/admin/avaliacoes", label: "Avaliações", Icone: MessageSquare },
  { href: "/admin/cardapio", label: "Cardápio", Icone: UtensilsCrossed },
  { href: "/admin/configuracoes", label: "Configurações", Icone: Settings },
  { href: "/admin/perfil", label: "Minha conta", Icone: User },
];

/** Navegação do painel da equipe, com destaque da página atual. */
export function NavAdmin() {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel" className="sem-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4">
      {LINKS.map(({ href, label, Icone }) => {
        const ativo = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
              ativo
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icone className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
