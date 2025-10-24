
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Edit, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getInstitutions, addInstitution, updateInstitution, deleteInstitution } from '@/lib/institution-service';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Institution = {
  id: string;
  name: string;
  anoName: string;
  type: 'School' | 'College';
  cadetCount: number;
};


export default function InstitutionsPage() {
  const [institutionsData, setInstitutionsData] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Add Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInstitutionName, setNewInstitutionName] = useState('');
  const [newAnoName, setNewAnoName] = useState('');
  const [newInstitutionType, setNewInstitutionType] = useState<'School' | 'College'>('College');

  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  // State for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingInstitution, setDeletingInstitution] = useState<Institution | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function fetchInstitutions() {
      setLoading(true);
      const institutions = await getInstitutions();
      setInstitutionsData(institutions as Institution[]);
      setLoading(false);
  }

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleAddInstitution = async () => {
    if (!newInstitutionName || !newAnoName) {
        toast({ title: "Missing fields", description: "Please enter both institution and ANO name.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
        await addInstitution({ name: newInstitutionName, anoName: newAnoName, type: newInstitutionType });
        setNewInstitutionName('');
        setNewAnoName('');
        setNewInstitutionType('College');
        setIsSubmitting(false);
        setIsAddDialogOpen(false);
        toast({ title: "Success", description: "Institution added successfully." });
        fetchInstitutions();
    } catch (error) {
        console.error("Failed to add institution:", error);
        toast({ title: "Error", description: "Failed to add institution. Please try again.", variant: "destructive" });
        setIsSubmitting(false);
    }
  };

  const openEditDialog = (institution: Institution) => {
    setEditingInstitution(institution);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInstitution = async () => {
    if (!editingInstitution || !editingInstitution.name || !editingInstitution.anoName) {
        toast({ title: "Missing fields", description: "Please enter both institution and ANO name.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const { id, name, anoName, type } = editingInstitution;
      await updateInstitution(id, { name, anoName, type });
      setIsSubmitting(false);
      setIsEditDialogOpen(false);
      setEditingInstitution(null);
      toast({ title: "Success", description: "Institution updated successfully." });
      fetchInstitutions();
    } catch (error) {
      console.error("Failed to update institution:", error);
      toast({ title: "Error", description: "Failed to update institution. Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (institution: Institution) => {
    setDeletingInstitution(institution);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteInstitution = async () => {
    if (!deletingInstitution) return;
    setIsSubmitting(true);
    try {
      await deleteInstitution(deletingInstitution.id);
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeletingInstitution(null);
      toast({ title: "Success", description: "Institution deleted successfully." });
      fetchInstitutions();
    } catch (error) {
      console.error("Failed to delete institution:", error);
      toast({ title: "Error", description: "Failed to delete institution. Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const filteredInstitutions = institutionsData.filter((institution) =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ADD DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Add New Institution</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution-name" className="text-right">Institution</Label>
              <Input id="institution-name" value={newInstitutionName} onChange={(e) => setNewInstitutionName(e.target.value)} className="col-span-3" placeholder="e.g., St. Joseph's College" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ano-name" className="text-right">ANO Name</Label>
              <Input id="ano-name" value={newAnoName} onChange={(e) => setNewAnoName(e.target.value)} className="col-span-3" placeholder="Associate NCC Officer's Name" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution-type" className="text-right">Type</Label>
                <Select onValueChange={(value: 'School' | 'College') => setNewInstitutionType(value)} value={newInstitutionType}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="College">College</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleAddInstitution} disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Institution'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Institution</DialogTitle></DialogHeader>
          {editingInstitution && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-institution-name" className="text-right">Institution</Label>
                <Input id="edit-institution-name" value={editingInstitution.name} onChange={(e) => setEditingInstitution({...editingInstitution, name: e.target.value})} className="col-span-3"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ano-name" className="text-right">ANO Name</Label>
                <Input id="edit-ano-name" value={editingInstitution.anoName} onChange={(e) => setEditingInstitution({...editingInstitution, anoName: e.target.value})} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-institution-type" className="text-right">Type</Label>
                <Select onValueChange={(value: 'School' | 'College') => setEditingInstitution({...editingInstitution, type: value})} value={editingInstitution.type}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="College">College</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setEditingInstitution(null)}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleUpdateInstitution} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the institution "{deletingInstitution?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting} onClick={() => setDeletingInstitution(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInstitution} disabled={isSubmitting}>{isSubmitting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Institutions</h1>
        <div className="flex-1 w-full md:w-auto flex flex-col sm:flex-row justify-end items-center gap-4">
            <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" placeholder="Search institutions..." className="pl-10 bg-white/20 backdrop-blur-sm border-white/30" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
             <Button className="w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Institution
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2 pt-4"><Skeleton className="h-10 flex-1" /><Skeleton className="h-10 w-20" /></div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredInstitutions.map((institution) => (
            <Card key={institution.id} className="bg-card/80 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-lg border rounded-xl border-white/20 flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary">{institution.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{institution.type}</p>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow flex flex-col">
                <div className="flex-grow">
                  <p><span className="font-semibold">ANO:</span> {institution.anoName}</p>
                  <p><span className="font-semibold">Total Cadets:</span> {institution.cadetCount}</p>
                </div>
                 <div className="flex gap-2 pt-4">
                    <Link href={`/institutions/${encodeURIComponent(institution.name)}/cadets`} className="flex-1">
                        <Button variant="outline" className="w-full group bg-transparent hover:bg-black/10">View Cadets</Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(institution)}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(institution)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                 </div>
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

    