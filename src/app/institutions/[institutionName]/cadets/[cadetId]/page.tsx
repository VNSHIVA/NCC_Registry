
'use client';
import React, { useEffect, useState } from 'react';
import { getCadet, deleteCadet } from '@/lib/cadet-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2, Award, Calendar, MapPin, Star, Shield, Trophy, Users, CheckCircle } from 'lucide-react';
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
const migrateCadetDataForDisplay = (data: any) => {
    if (!data.camps || !Array.isArray(data.camps)) {
        if(!data.camps) data.camps = [];
    }
     if (!data.certificates || !Array.isArray(data.certificates)) {
        if(!data.certificates) data.certificates = [];
    }
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
        data = migrateCadetDataForDisplay(data);
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
              <CardTitle className="text-2xl font-bold text-primary">{cadet.Cadet_Name}</CardTitle>
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

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">NCC Specific Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div><strong className="font-medium text-muted-foreground">Rank:</strong> {cadet.rank}</div>
              <div><strong className="font-medium text-muted-foreground">Division:</strong> {cadet.division}</div>
              <div><strong className="font-medium text-muted-foreground">Batch:</strong> {cadet.batch}</div>
              <div><strong className="font-medium text-muted-foreground">Army Type:</strong> {cadet.armytype}</div>
              <div><strong className="font-medium text-muted-foreground">Institution:</strong> {cadet.institution}</div>
               <div><strong className="font-medium text-muted-foreground">Willing to undergo Military Training:</strong> {cadet.Willingness_to_undergo_Military_Training}</div>
                <div><strong className="font-medium text-muted-foreground">Willing to serve in NCC:</strong> {cadet.Willingness_to_serve_in_NCC}</div>
                <div><strong className="font-medium text-muted-foreground">Previously Applied:</strong> {cadet.Previously_Applied_for_enrollment}</div>
                <div><strong className="font-medium text-muted-foreground">Dismissed from NCC/TA/AF:</strong> {cadet.Dismissed_from_NCC_TA_AF}</div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">NCC Certificates Obtained</h3>
            {cadet.certificates && cadet.certificates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {cadet.certificates.map((cert: any, index: number) => (
                        <div key={index} className="p-4 bg-white/10 rounded-lg border border-white/20 flex items-center gap-4">
                            <Award className="h-8 w-8 text-accent"/>
                            <div>
                                <p className="font-semibold">{cert.certificate_type}</p>
                                <p className="text-sm text-muted-foreground">
                                    Grade: {cert.certificate_grade} | Year: {cert.certificate_year}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No certificates obtained.</p>
            )}
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div><strong className="font-medium text-muted-foreground">Date of Birth:</strong> {cadet.Date_of_Birth}</div>
              <div><strong className="font-medium text-muted-foreground">Gender:</strong> {cadet.Cadet_Gender}</div>
              <div><strong className="font-medium text-muted-foreground">Mobile:</strong> {cadet.Cadet_Mobile_No}</div>
              <div><strong className="font-medium text-muted-foreground">Email:</strong> {cadet.Email_Address}</div>
              <div><strong className="font-medium text-muted-foreground">Nationality:</strong> {cadet.Nationality}</div>
              <div><strong className="font-medium text-muted-foreground">Identification Mark:</strong> {cadet.Identification_Mark}</div>
              <div><strong className="font-medium text-muted-foreground">Blood Group:</strong> {cadet.Blood_Group}</div>
              <div><strong className="font-medium text-muted-foreground">Aadhaar No:</strong> {cadet.adhaarnumber}</div>
            </div>
          </section>

           <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div><strong className="font-medium text-muted-foreground">Father's Name:</strong> {cadet.Father_s_Name}</div>
              <div><strong className="font-medium text-muted-foreground">Mother's Name:</strong> {cadet.Mother_s_Name}</div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Permanent Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div><strong className="font-medium text-muted-foreground">House No:</strong> {cadet.House_No}</div>
                <div><strong className="font-medium text-muted-foreground">Building:</strong> {cadet.Building_Name}</div>
                <div><strong className="font-medium text-muted-foreground">Area:</strong> {cadet.Area}</div>
                <div><strong className="font-medium text-muted-foreground">City:</strong> {cadet.city}</div>
                <div><strong className="font-medium text-muted-foreground">State:</strong> {cadet.state}</div>
                <div><strong className="font-medium text-muted-foreground">PIN Code:</strong> {cadet.Permanent_Address_Pin_code}</div>
                <div className="md:col-span-2"><strong className="font-medium text-muted-foreground">NRS:</strong> {cadet.Permanent_Address_Nrs}</div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Education & Medical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><strong className="font-medium text-muted-foreground">Education:</strong> {cadet.Education_Qualification}</div>
                <div><strong className="font-medium text-muted-foreground">Institution Type:</strong> {cadet.institutetype}</div>
                <div className="md:col-span-2"><strong className="font-medium text-muted-foreground">Medical Complaint:</strong> {cadet.Medical_Complaint_if_any}</div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Next of Kin (NOK) Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div><strong className="font-medium text-muted-foreground">Name:</strong> {cadet.NOK_Name}</div>
              <div><strong className="font-medium text-muted-foreground">Relation:</strong> {cadet.NOK_Relationship}</div>
              <div><strong className="font-medium text-muted-foreground">Contact:</strong> {cadet.NOK_Contact_Number}</div>
              <div><strong className="font-medium text-muted-foreground">House No:</strong> {cadet.NOK_House_No}</div>
              <div><strong className="font-medium text-muted-foreground">Building:</strong> {cadet.NOK_Building_Name}</div>
              <div><strong className="font-medium text-muted-foreground">Area:</strong> {cadet.NOK_Area}</div>
              <div><strong className="font-medium text-muted-foreground">City:</strong> {cadet.nokcity}</div>
              <div><strong className="font-medium text-muted-foreground">State:</strong> {cadet.nokstate}</div>
              <div><strong className="font-medium text-muted-foreground">Pincode:</strong> {cadet.NOK_Pincode}</div>
              <div className="md:col-span-2"><strong className="font-medium text-muted-foreground">NRS:</strong> {cadet.noknrs}</div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Activities & Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><strong className="font-medium text-muted-foreground">Sports/Games:</strong> {cadet.Sports_Games}</div>
                <div><strong className="font-medium text-muted-foreground">Co-Curricular:</strong> {cadet.Co_Curricular_Activity}</div>
                <div><strong className="font-medium text-muted-foreground">Criminal Court Case:</strong> {cadet.Criminal_Court}</div>
            </div>
          </section>

           <section>
                <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Camps Attended</h3>
                {cadet.camps && cadet.camps.length > 0 ? (
                     <Accordion type="multiple" className="w-full" defaultValue={cadet.camps.map((_:any, i:number) => `item-${i}`)}>
                        {cadet.camps.map((camp: any, index: number) => (
                           <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                     <div className="flex flex-col text-left">
                                        <p className="font-semibold text-primary">{getCampLabel(camp.campType)} {camp.level ? ` - ${camp.level}` : ''}</p>
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

    