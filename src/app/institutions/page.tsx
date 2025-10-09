'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Edit } from 'lucide-react';
import Link from 'next/link';
import { getInstitutions } from '@/lib/institution-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstitutionsPage() {
  const [institutionsData, setInstitutionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchInstitutions() {
      const institutions = await getInstitutions();
      setInstitutionsData(institutions);
      setLoading(false);
    }
    fetchInstitutions();
  }, []);

  const filteredInstitutions = institutionsData.filter((institution) =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Institutions</h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search institutions..."
            className="pl-10 bg-white/20 backdrop-blur-sm border-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-card shadow-lg backdrop-blur-lg border rounded-xl border-white/30">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))
        ) : (
          filteredInstitutions.map((institution, index) => (
            <Card key={index} className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-lg border rounded-xl border-white/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary">{institution.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  <span className="font-semibold">Principal:</span> {institution.principal}
                </p>
                <p>
                  <span className="font-semibold">Total Cadets:</span> {institution.cadets}
                </p>
                 <Link href={`/institutions/${encodeURIComponent(institution.name)}/cadets`}>
                    <Button variant="outline" className="w-full mt-4 group bg-transparent hover:bg-black/10">
                      View Cadets
                      <Edit className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                 </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
