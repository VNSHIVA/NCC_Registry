import { Home, Building, Users, Search, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function CadetsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { institutionName: string };
}) {
  const institutionName = decodeURIComponent(params.institutionName);

  return (
    <div>
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex-1 text-center">
             <h1 className="text-xl font-semibold">Cadets of {institutionName}</h1>
          </div>
          <div className="flex items-center space-x-4">
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
