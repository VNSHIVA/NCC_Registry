
'use client';

import { useState, useEffect } from 'react';
import { getArchivedCadetsByInstitution } from '@/lib/cadet-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type ArchivedCadet = {
    id: string;
    Cadet_Name: string;
    regNo: string;
    batch: string;
    institutionName: string;
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
                <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Cadets by Institution</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="multiple" className="w-full">
                            {groupedCadets.map(({ institutionName, cadets }) => (
                                <AccordionItem value={institutionName} key={institutionName}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex justify-between w-full pr-4">
                                            <span className="font-semibold text-primary/90">{institutionName}</span>
                                            <span className="text-muted-foreground">{cadets.length} archived cadet(s)</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-2 pt-2">
                                            {cadets.map(cadet => (
                                                <li key={cadet.id} className="p-3 bg-white/10 rounded-lg border border-white/20 flex justify-between items-center">
                                                    <div>
                                                        <Link href={`/institutions/${encodeURIComponent(cadet.institutionName)}/cadets/${cadet.id}`} className="font-medium hover:underline">
                                                            {cadet.Cadet_Name}
                                                        </Link>
                                                        <p className="text-sm text-muted-foreground">Reg. No: {cadet.regNo} | Batch: {cadet.batch}</p>
                                                    </div>
                                                    <Link href={`/institutions/${encodeURIComponent(cadet.institutionName)}/cadets/${cadet.id}`}>
                                                        <span className="text-sm text-primary hover:underline">View Details</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
