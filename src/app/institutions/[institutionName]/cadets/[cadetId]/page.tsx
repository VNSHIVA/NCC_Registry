'use client';
import React, { useEffect, useState } from 'react';
import { getCadet, deleteCadet } from '@/lib/cadet-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2, Award, Calendar, MapPin, Star, Shield, Trophy } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import { campTypes } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// This migration function can be removed if all data is in the new format
const migrateCampsDataForDisplay = (data: any) => {
    if (!data.camps || Array.isArray(data.camps.map)) {
        if(!data.camps) data.camps = [];
        return data;
    }
    // Simple migration, can be enhanced
    const newCamps: any[] = [];
    data.camps = newCamps;
    return data;
};


export default function CadetDetailsPage({ params }: { params: { institutionName: string; cadetId: string } }) {
  const resolvedParams = React.use(params);
  const institutionName = decodeURIComponent(resolvedParams.institutionName);
  const cadetId = resolvedParams.cadetId;
  const router = useRouter();

  const [cadet, setCadet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCadet() {
      setLoading(true);
      let data = await getCadet(cadetId);
      if (data) {
        data = migrateCampsDataForDisplay(data);
      }
      setCadet(data);
      setLoading(false);
    }
    fetchCadet();
  }, [cadetId]);

  const handleDelete = async () => {
    try {
      await deleteCadet(cadetId, institutionName);
      router.push(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
    } catch (error) {
      console.error("Failed to delete cadet", error);
    }
  };
  
  const getCampLabel = (typeValue: string) => {
    const camp = campTypes.find(c => c.value === typeValue);
    return camp ? camp.label : typeValue;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/4 mb-4" />
        <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <section key={i}>
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-10 w-full" />)}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cadet) {
    return <div className="container mx-auto px-4 py-8 text-center">Cadet not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets`} className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Cadets List
      </Link>
      <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">{cadet.name}</CardTitle>
              <p className="text-muted-foreground">{cadet.regNo}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets/${cadet.id}/edit`}>
                <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the cadet's record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Personal Details */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div><strong className="font-medium text-muted-foreground">Rank:</strong> {cadet.rank}</div>
              <div><strong className="font-medium text-muted-foreground">Institution:</strong> {cadet.institution}</div>
              <div><strong className="font-medium text-muted-foreground">Date of Birth:</strong> {cadet.dob}</div>
              <div><strong className="font-medium text-muted-foreground">Mobile:</strong> {cadet.mobile}</div>
              <div><strong className="font-medium text-muted-foreground">Email:</strong> {cadet.email}</div>
              <div><strong className="font-medium text-muted-foreground">Education:</strong> {cadet.education}</div>
              <div><strong className="font-medium text-muted-foreground">Blood Group:</strong> {cadet.bloodGroup}</div>
              <div><strong className="font-medium text-muted-foreground">Adhaar No:</strong> {cadet.adhaar}</div>
              <div><strong className="font-medium text-muted-foreground">Sports/Culturals:</strong> {cadet.sportsCulturals}</div>
              <div className="md:col-span-2"><strong className="font-medium text-muted-foreground">Home Address:</strong> {cadet.homeAddress}</div>
            </div>
          </section>

          {/* NOK Details */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Next of Kin (NOK) Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div><strong className="font-medium text-muted-foreground">Name:</strong> {cadet.nokName}</div>
              <div><strong className="font-medium text-muted-foreground">Relation:</strong> {cadet.nokRelation}</div>
              <div><strong className="font-medium text-muted-foreground">Contact:</strong> {cadet.nokContact}</div>
            </div>
          </section>

          {/* Camp Details */}
           <section>
                <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Camps Attended</h3>
                {cadet.camps && cadet.camps.length > 0 ? (
                     <Accordion type="multiple" className="w-full">
                        {cadet.camps.map((camp: any, index: number) => (
                           <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                     <div className="flex flex-col text-left">
                                        <p className="font-semibold text-primary">{getCampLabel(camp.campType)}</p>
                                        <p className="text-sm text-muted-foreground">{camp.location}</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 pl-2 border-l-2 ml-2 border-accent">
                                        {camp.level && <p className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-muted-foreground" /> <strong>Level:</strong> {camp.level}</p>}
                                        <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> <strong>Location:</strong> {camp.location}</p>
                                        <p className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <strong>Dates:</strong> {camp.startDate || 'N/A'} to {camp.endDate || 'N/A'} ({camp.durationDays || 'N/A'} days)
                                        </p>
                                        {camp.reward && (
                                            <p className="flex items-center gap-2 text-sm text-amber-600">
                                                <Trophy className="h-4 w-4" />
                                                <strong>Reward:</strong> {camp.reward}
                                            </p>
                                        )}
                                        {camp.certificateUrl && (
                                            <Link href={camp.certificateUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="link" className="p-0 h-auto text-sm">View Certificate</Button>
                                            </Link>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="text-muted-foreground">No camps attended.</p>
                )}
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
