import Image from "next/image";
import Link from "next/link";
import { NavAdmin } from "@/components/admin/NavAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="vidro sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-14 items-center justify-between gap-3">
            <Link href="/admin/recebimentos" className="flex items-center gap-3">
              <span className="anel-dourado shrink-0">
                <Image
                  src="/logo-nina-burguer.jpeg"
                  alt=""
                  width={34}
                  height={34}
                  className="block rounded-full"
                />
              </span>
              <span className="flex items-baseline gap-2 leading-none">
                <span className="titulo-display texto-dourado text-2xl">Nina Burguer</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Painel
                </span>
              </span>
            </Link>
            <Link href="/cardapio" className="text-xs text-muted-foreground hover:text-foreground">
              Ver site
            </Link>
          </div>
          <div className="pb-2">
            <NavAdmin />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
