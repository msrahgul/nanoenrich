import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* 
          - On Home Page: pt-0 because Hero is h-screen and sits behind fixed navbar.
          - On Other Pages: pt-14/pt-16 to ensure content isn't hidden by the fixed navbar.
      */}
      <main className={cn("flex-1", !isHomePage && "pt-20 md:pt-24")}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
