import { CartProvider } from "@/lib/cart/CartContext";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="mx-auto min-h-screen max-w-2xl bg-[var(--color-background)] px-4 pb-24 pt-6">
        {children}
      </div>
    </CartProvider>
  );
}
