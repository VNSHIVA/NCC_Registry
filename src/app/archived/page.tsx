

'use client';

import { useState, useEffect } from 'react';
import { getArchivedCadets } from '@/lib/cadet-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { campTypes } from '@/lib/constants';

type ArchivedCadet = {
    id: string;
    Cadet_Name: string;
    regNo: string;
    batch: string;
    institutionName: string;
    rank: string;
    Blood_Group: string;
    division: string;
    camps?: { campType: string }[];
};

type GroupedCadets = {
    institutionName: string;
    cadets: ArchivedCadet[];
};

type Institution = {
    id: string;
    name: string;
}

export default function ArchivedCadetsPage() {
    const [allCadets, setAllCadets] = useState<ArchivedCadet[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        batch: 'all',
        rank: 'all',
        bloodGroup: 'all',
        division: 'all',
        institutionName: 'all',
        camp: 'all',
        attendance: 'attended'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const cadetsPerPage = 9;

    useEffect(() => {
        async function fetchArchived() {
            setLoading(true);
            const { archivedCadets, institutions } = await getArchivedCadets();
            setAllCadets(archivedCadets as ArchivedCadet[]);
            setAllInstitutions(institutions);
            setLoading(false);
        }
        fetchArchived();
    }, []);

    const filteredCadets = allCadets.filter(cadet => {
        const hasAttendedCamp = (campType: string) => {
            if (!campType || campType === 'all') return true;
            return cadet.camps?.some((c: any) => c.campType === campType);
        };
        
        const campFilterMatch = filters.camp === 'all' 
            ? true 
            : filters.attendance === 'attended' 
                ? hasAttendedCamp(filters.camp) 
                : !hasAttendedCamp(filters.camp);
        
        return (
            (cadet.Cadet_Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) &&
            (filters.batch === 'all' || cadet.batch?.toString() === filters.batch) &&
            (filters.rank === 'all' || cadet.rank === filters.rank) &&
            (filters.bloodGroup === 'all' || cadet.Blood_Group === filters.bloodGroup) &&
            (filters.division === 'all' || cadet.division === filters.division) &&
            (filters.institutionName === 'all' || cadet.institutionName === filters.institutionName) &&
            campFilterMatch
        );
    });

    const groupedAndFilteredCadets = filteredCadets.reduce((acc, cadet) => {
        const institutionName = cadet.institutionName || 'Unknown Institution';
        if (!acc[institutionName]) {
            acc[institutionName] = [];
        }
        acc[institutionName].push(cadet);
        return acc;
    }, {} as { [key: string]: ArchivedCadet[] });
    
    // Create a flat list for pagination
    const cadetsToPaginate = Object.values(groupedAndFilteredCadets).flat();
    const indexOfLastCadet = currentPage * cadetsPerPage;
    const indexOfFirstCadet = indexOfLastCadet - cadetsPerPage;
    const currentCadets = cadetsToPaginate.slice(indexOfFirstCadet, indexOfLastCadet);

    const paginatedGroupedCadets = currentCadets.reduce((acc, cadet) => {
        const institutionName = cadet.institutionName || 'Unknown Institution';
        if (!acc[institutionName]) {
            acc[institutionName] = [];
        }
        acc[institutionName].push(cadet);
        return acc;
    }, {} as { [key: string]: ArchivedCadet[] });


    const totalPages = Math.ceil(cadetsToPaginate.length / cadetsPerPage);
    const batchYears = [...new Set(allCadets.map(c => c.batch).filter(Boolean))].sort((a, b) => parseInt(b) - parseInt(a));
    
    const handleReset = () => {
        setSearchTerm('');
        setFilters({ batch: 'all', rank: 'all', bloodGroup: 'all', division: 'all', institutionName: 'all', camp: 'all', attendance: 'attended' });
        setCurrentPage(1);
    }
    
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

             <Card className="mb-8 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <Label htmlFor="search-name">Search by Name</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="search-name" type="search" placeholder="Search..." className="pl-10 mt-1 bg-white/20" onChange={e => setSearchTerm(e.target.value)} value={searchTerm} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="batch-filter">Batch / Year</Label>
                            <Select onValueChange={value => setFilters(f => ({ ...f, batch: value }))} value={filters.batch}>
                                <SelectTrigger className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {batchYears.map((year, index) => <SelectItem key={`${year}-${index}`} value={String(year)}>{year}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="division-filter">Division</Label>
                            <Select onValueChange={value => setFilters(f => ({ ...f, division: value }))} value={filters.division}>
                                <SelectTrigger id="division-filter" className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="SD">Senior Division (SD)</SelectItem>
                                    <SelectItem value="SW">Senior Wing (SW)</SelectItem>
                                    <SelectItem value="JD">Junior Division (JD)</SelectItem>
                                    <SelectItem value="JW">Junior Wing (JW)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="institution-filter">Institution</Label>
                            <Select onValueChange={value => setFilters(f => ({ ...f, institutionName: value }))} value={filters.institutionName}>
                                <SelectTrigger id="institution-filter" className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Institutions</SelectItem>
                                    {allInstitutions.map(inst => <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="blood-group-filter">Blood Group</Label>
                            <Select onValueChange={value => setFilters(f => ({ ...f, bloodGroup: value }))} value={filters.bloodGroup}>
                                <SelectTrigger id="blood-group-filter" className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="rank-filter">Rank</Label>
                            <Select onValueChange={value => setFilters(f => ({ ...f, rank: value }))} value={filters.rank}>
                                <SelectTrigger className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {['CDT', 'LCPL', 'CPL', 'SGT', 'CSM', 'JUO', 'SUO'].map(rank => <SelectItem key={rank} value={rank}>{rank}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                             <div>
                                <Label htmlFor="camp-filter">Camp Attended</Label>
                                <Select onValueChange={value => setFilters(f => ({ ...f, camp: value }))} value={filters.camp}>
                                    <SelectTrigger id="camp-filter" className="mt-1 bg-white/20"><SelectValue placeholder="Any" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Camp</SelectItem>
                                        {campTypes.map(camp => <SelectItem key={camp.value} value={camp.value}>{camp.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="attendance-filter">Status</Label>
                                <Select onValueChange={value => setFilters(f => ({ ...f, attendance: value }))} value={filters.attendance} disabled={filters.camp === 'all'}>
                                    <SelectTrigger id="attendance-filter" className="mt-1 bg-white/20"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="attended">Attended</SelectItem>
                                        <SelectItem value="not-attended">Not Attended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end mt-6">
                        <Button variant="outline" onClick={handleReset} className="bg-transparent hover:bg-black/10">Reset Filters</Button>
                    </div>
                </CardContent>
            </Card>
            
            {filteredCadets.length === 0 ? (
                <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                     <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No archived cadets found matching your criteria.</p>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4" defaultValue={Object.keys(paginatedGroupedCadets)}>
                    {Object.entries(paginatedGroupedCadets).map(([institutionName, cadets]) => (
                        <AccordionItem value={institutionName} key={institutionName} className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20 px-6">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex justify-between w-full">
                                    <span className="font-semibold text-xl text-primary/90">{institutionName}</span>
                                    <span className="text-muted-foreground self-end">{cadets.length} archived cadet(s) on this page</span>
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
                                                <div className="w-full mt-2">
                                                    <Link href={`/institutions/${encodeURIComponent(cadet.institutionName)}/cadets/${cadet.id}`} className="flex-1">
                                                        <Button variant="outline" className="w-full bg-transparent hover:bg-black/10">View</Button>
                                                    </Link>
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

            <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-muted-foreground">
                    Showing {cadetsToPaginate.length > 0 ? indexOfFirstCadet + 1 : 0}–{Math.min(indexOfLastCadet, cadetsToPaginate.length)} of {cadetsToPaginate.length} Archived Cadets
                </p>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
