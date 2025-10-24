
'use client';

import { useState, useEffect } from 'react';
import { getArchivedCadetsByInstitution } from '@/lib/cadet-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ArchivedCadet = {
    id: string;
    Cadet_Name: string;
    regNo: string;
    batch: string;
    institutionName: string;
    rank: string;
    Blood_Group: string;
};

type GroupedCadets = {
    institutionName: string;
    cadets: ArchivedCadet[];
};

export default function ArchivedCadetsPage() {
    const [groupedCadets, setGroupedCadets] = useState<GroupedCadets[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArchived() {
            setLoading(true);
            const data = await getArchivedCadetsByInstitution();
            setGroupedCadets(data);
            setLoading(false);
        }
        fetchArchived();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-9 w-64 mb-8" />
                <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-primary mb-8">Archived Cadets</h1>
            
            {groupedCadets.length === 0 ? (
                <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                     <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No archived cadets found.</p>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4">
                    {groupedCadets.map(({ institutionName, cadets }) => (
                        <AccordionItem value={institutionName} key={institutionName} className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20 px-6">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex justify-between w-full">
                                    <span className="font-semibold text-xl text-primary/90">{institutionName}</span>
                                    <span className="text-muted-foreground self-end">{cadets.length} archived cadet(s)</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-white/20">
                                     {cadets.map(cadet => (
                                        <Card key={cadet.id} className="bg-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-lg border rounded-xl border-white/20 overflow-hidden relative">
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <h3 className="text-lg font-semibold text-primary pt-4">{cadet.Cadet_Name}</h3>
                                                <p className="text-sm text-muted-foreground">{cadet.regNo}</p>
                                                <div className="flex justify-center gap-4 my-3 text-sm">
                                                    <div><span className="font-semibold">Rank:</span> {cadet.rank || 'N/A'}</div>
                                                    <div><span className="font-semibold">Batch:</span> {cadet.batch}</div>
                                                    <div><span className="font-semibold">Blood:</span> {cadet.Blood_Group || 'N/A'}</div>
                                                </div>
                                                <div className="text-xs font-bold text-accent-foreground bg-accent/20 px-2 py-1 rounded-full mb-2">Archived</div>
                                                <div className="flex gap-2 w-full mt-2">
                                                    <Link href={`/institutions/${encodeURIComponent(cadet.institutionName)}/cadets/${cadet.id}`} className="flex-1">
                                                        <Button variant="outline" className="w-full bg-transparent hover:bg-black/10">View</Button>
                                                    </Link>
                                                    <Button variant="default" className="w-full" disabled={true}>Edit</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}

