'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Edit, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getInstitutions, addInstitution } from '@/lib/institution-service';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';


export default function InstitutionsPage() {
  const [institutionsData, setInstitutionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newInstitutionName, setNewInstitutionName] = useState('');
  const [newAnoName, setNewAnoName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  async function fetchInstitutions() {
      setLoading(true);
      const institutions = await getInstitutions();
      setInstitutionsData(institutions);
      setLoading(false);
  }

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleAddInstitution = async () => {
    if (!newInstitutionName || !newAnoName) {
        toast({
            title: "Missing fields",
            description: "Please enter both institution and ANO name.",
            variant: "destructive"
        })
        return;
    }
    setIsSubmitting(true);
    try {
        await addInstitution({ name: newInstitutionName, anoName: newAnoName });
        setNewInstitutionName('');
        setNewAnoName('');
        setIsSubmitting(false);
        setIsDialogOpen(false);
        toast({
            title: "Success",
            description: "Institution added successfully."
        })
        fetchInstitutions(); // Re-fetch to update the list
    } catch (error) {
        console.error("Failed to add institution:", error);
        toast({
            title: "Error",
            description: "Failed to add institution. Please try again.",
            variant: "destructive"
        })
        setIsSubmitting(false);
    }
  };


  const filteredInstitutions = institutionsData.filter((institution) =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Institutions</h1>
        <div className="flex-1 flex justify-end items-center gap-4">
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Institution
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Institution</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="institution-name" className="text-right">
                                Institution
                            </Label>
                            <Input
                                id="institution-name"
                                value={newInstitutionName}
                                onChange={(e) => setNewInstitutionName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., St. Joseph's College"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ano-name" className="text-right">
                                ANO Name
                            </Label>
                            <Input
                                id="ano-name"
                                value={newAnoName}
                                onChange={(e) => setNewAnoName(e.target.value)}
                                className="col-span-3"
                                placeholder="Associate NCC Officer's Name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleAddInstitution} disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Institution'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                  <span className="font-semibold">ANO:</span> {institution.anoName}
                </p>
                <p>
                  <span className="font-semibold">Total Cadets:</span> {institution.cadetCount}
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
       {filteredInstitutions.length === 0 && !loading && (
            <div className="text-center py-12 col-span-full">
                <p className="text-muted-foreground">No institutions found.</p>
                <p className="text-sm text-muted-foreground mt-2">Click "Add Institution" to get started.</p>
            </div>
        )}
    </div>
  );
}
