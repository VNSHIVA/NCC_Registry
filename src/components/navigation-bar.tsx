
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building, Home, Users, Menu, X, LayoutDashboard, Archive } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-primary/80 text-primary-foreground shadow-md backdrop-blur-sm sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <img src="/ncc_logo0.png" width={40} height={40} alt="NCC Logo" className=" rounded-full"/>
            <span className="hidden sm:inline font-headline">2(TN) ARMD SQN NCC</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 hover:text-black font-semibold">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
           <Link href="/dashboard" className="flex items-center space-x-2 hover:text-black font-semibold">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/institutions" className="flex items-center space-x-2 hover:text-black font-semibold">
            <Building className="h-5 w-5" />
            <span>Institutions</span>
          </Link>
          <Link href="/archived" className="flex items-center space-x-2 hover:text-black font-semibold">
            <Archive className="h-5 w-5" />
            <span>Archived</span>
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
          <Link href="/" className="flex items-center space-x-2 py-2 hover:text-black font-semibold" onClick={() => setIsMenuOpen(false)}>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link href="/dashboard" className="flex items-center space-x-2 py-2 hover:text-black font-semibold" onClick={() => setIsMenuOpen(false)}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/institutions" className="flex items-center space-x-2 py-2 hover:text-black font-semibold" onClick={() => setIsMenuOpen(false)}>
            <Building className="h-5 w-5" />
            <span>Institutions</span>
          </Link>
          <Link href="/archived" className="flex items-center space-x-2 py-2 hover:text-black font-semibold" onClick={() => setIsMenuOpen(false)}>
            <Archive className="h-5 w-5" />
            <span>Archived</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
