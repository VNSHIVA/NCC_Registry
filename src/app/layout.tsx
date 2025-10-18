
'use client';
import { useState } from 'react';
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Link from 'next/link';
import { Building, Home, Users, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", !isHomePage && "bg")}>
      <nav className="bg-primary/90 text-primary-foreground shadow-md backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
              <img src="/ncc_logo0.png" width={40} height={40} alt="NCC Logo" className="bg-white rounded-full"/>
              <span className="hidden sm:inline font-headline">2(TN) ARMD SQN NCC</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:text-accent font-semibold">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link href="/institutions" className="flex items-center space-x-2 hover:text-accent font-semibold">
              <Building className="h-5 w-5" />
              <span>Institutions</span>
            </Link>
          </div>
           <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
         {isMenuOpen && (
          <div className="md:hidden px-6 pb-4">
            <Link href="/" className="flex items-center space-x-2 py-2 hover:text-accent font-semibold" onClick={() => setIsMenuOpen(false)}>
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link href="/institutions" className="flex items-center space-x-2 py-2 hover:text-accent font-semibold" onClick={() => setIsMenuOpen(false)}>
              <Building className="h-5 w-5" />
              <span>Institutions</span>
            </Link>
          </div>
        )}
      </nav>
        <main className="min-h-[calc(100vh-68px)]">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
