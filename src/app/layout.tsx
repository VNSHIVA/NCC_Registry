
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/navigation-bar';

export const metadata: Metadata = {
  title: 'NCC Cadet Management',
  description: 'A comprehensive system for managing NCC cadets, institutions, and activities.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "bg")}>
        <NavigationBar />
        <main className="min-h-[calc(100vh-68px)]">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
