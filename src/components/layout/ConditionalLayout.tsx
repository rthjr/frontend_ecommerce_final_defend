'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { motion } from 'framer-motion';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isHomePage = pathname === '/';

  return (
    <>
      {!isAuthPage && <Header />}
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {isHomePage ? (
          // Homepage has full-width sections
          children
        ) : (
          // Other pages use constrained container
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        )}
      </motion.main>
      {!isAuthPage && <Footer />}
    </>
  );
}
