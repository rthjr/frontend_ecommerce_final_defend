import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/redux/StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-commerce App",
  description: "Full-featured e-commerce application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex min-h-screen flex-col`}>
        <StoreProvider>
          <AuthProvider>
            <Header />
            <CartDrawer />
            <main className="flex-1">
              <div className="container mx-auto px-4 py-6">
                {children}
              </div>
            </main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
