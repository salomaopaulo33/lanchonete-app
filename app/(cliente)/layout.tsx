import Image from "next/image";
import { CartProvider } from "@/lib/cart/CartContext";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="mx-auto min-h-screen max-w-2xl bg-[var(--color-background)] px-4 pb-24 pt-6">
        <div className="mb-6 flex justify-center">
          <Image src="/logo-nina-burguer.jpeg" alt="Nina Burguer" width={72} height={72} className="rounded-full" priority />
        </div>
        {children}
      </div>
    </CartProvider>
  );
}
