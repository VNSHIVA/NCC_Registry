import { Building, Home, Users } from 'lucide-react';
import Link from 'next/link';

export default function InstitutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <nav className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
              <img src="/ncc_logo0.png" width={40} height={40} alt="NCC Logo" className="bg-white rounded-full"/>
              <span>2(TN) ARMD SQN NCC</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:text-accent-foreground">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link href="/institutions" className="flex items-center space-x-2 hover:text-accent-foreground font-semibold">
              <Building className="h-5 w-5" />
              <span>Institutions</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 hover:text-accent-foreground">
              <Users className="h-5 w-5" />
              <span>Cadets</span>
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}