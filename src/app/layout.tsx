import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/redux/StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import CartDrawer from "@/components/cart/CartDrawer";
import RoleBasedRedirect from "@/components/auth/RoleBasedRedirect";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

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
      <body className={`${inter.className} antialiased flex min-h-screen flex-col  m-auto`}>
        <StoreProvider>
          <AuthProvider>
            <RoleBasedRedirect />
            <CartDrawer />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
