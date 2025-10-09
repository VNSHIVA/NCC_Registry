'use client';
import { Home, Building, Users, Search, UserCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CadetsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { institutionName: string };
}) {
  const pathname = usePathname();
  const institutionName = decodeURIComponent(params.institutionName);

  const isCadetListPage = pathname === `/institutions/${encodeURIComponent(institutionName)}/cadets`;

  return (
    <div>
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex-1">
          {isCadetListPage ? (
             <Link href="/institutions" className="flex items-center space-x-2 hover:text-accent-foreground text-sm">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Institutions</span>
            </Link>
          ) : <div/>}
        </div>
        <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold">Cadets of {institutionName}</h1>
        </div>
        <div className="flex-1 flex justify-end items-center space-x-4">
            <button className="hover:text-accent-foreground">
              <Search className="h-5 w-5" />
            </button>
            <button className="hover:text-accent-foreground">
              <UserCircle className="h-6 w-6" />
            </button>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
