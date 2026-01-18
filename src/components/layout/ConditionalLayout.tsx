'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  return (
    <>
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <div className="w-[1250px] m-auto px-4 py-6">
          {children}
        </div>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}
