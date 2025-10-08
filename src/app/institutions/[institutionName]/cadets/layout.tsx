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
    <div className="min-h-screen w-full" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-lg font-bold">
              <img src="/ncc_logo0.png" width={32} height={32} alt="NCC Logo" className="bg-white rounded-full"/>
              <span>2(TN) ARMD SQN NCC</span>
            </Link>
          </div>
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
      </nav>
      <main>{children}</main>
    </div>
  );
}
