import { CartProvider } from "@/lib/cart/CartContext";
import { CabecalhoCliente } from "@/components/layout/CabecalhoCliente";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="fundo-brilho flex min-h-screen flex-col">
        <CabecalhoCliente />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-36 pt-6">{children}</main>
      </div>
    </CartProvider>
  );
}
