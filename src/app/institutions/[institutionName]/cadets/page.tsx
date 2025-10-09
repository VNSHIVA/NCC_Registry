'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getCadets } from '@/lib/cadet-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function CadetsPage({ params }: { params: { institutionName: string } }) {
    const resolvedParams = React.use(params);
    const institutionName = decodeURIComponent(resolvedParams.institutionName);
    
    const [cadetsData, setCadetsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ batch: 'all', rank: 'all', bloodGroup: 'all' });
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const cadetsPerPage = 9;

    useEffect(() => {
        async function fetchCadets() {
            setLoading(true);
            const cadets = await getCadets(institutionName);
            setCadetsData(cadets);
            setLoading(false);
        }
        fetchCadets();
    }, [institutionName]);

    const filteredCadets = cadetsData.filter(cadet => {
        const batchNumber = parseInt(cadet.batch);
        const isActive = batchNumber ? (new Date().getFullYear() - batchNumber) < 3 : false;
        
        return (
            (cadet.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) &&
            (filters.batch === 'all' || cadet.batch?.toString() === filters.batch) &&
            (filters.rank === 'all' || cadet.rank === filters.rank) &&
            (filters.bloodGroup === 'all' || cadet.bloodGroup === filters.bloodGroup) &&
            (!showActiveOnly || isActive) 
        );
    });
    
    const indexOfLastCadet = currentPage * cadetsPerPage;
    const indexOfFirstCadet = indexOfLastCadet - cadetsPerPage;
    const currentCadets = filteredCadets.slice(indexOfFirstCadet, indexOfLastCadet);

    const totalPages = Math.ceil(filteredCadets.length / cadetsPerPage);

    const handleReset = () => {
        setSearchTerm('');
        setFilters({ batch: 'all', rank: 'all', bloodGroup: 'all' });
        setShowActiveOnly(true);
        setCurrentPage(1);
    }
    
    const batchYears = [...new Set(cadetsData.map(c => c.batch).filter(Boolean))].sort((a, b) => b - a);

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mb-8 bg-card shadow-lg backdrop-blur-lg border rounded-xl border-white/30">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="relative">
                            <Label htmlFor="search-name">Search by Name</Label>
                            <Search className="absolute left-3 top-10 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="search-name" type="search" placeholder="Search..." className="pl-10 mt-1 bg-white/20" onChange={e => setSearchTerm(e.target.value)} value={searchTerm} />
                        </div>
                        <div>
                            <Label htmlFor="batch-filter">Batch / Year</Label>
                            <Select onValueChange={value => setFilters(f => ({ ...f, batch: value }))} value={filters.batch}>
                                <SelectTrigger className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {batchYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
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
                        <div>
                            <Label htmlFor="blood-group-filter">Blood Group</Label>
                            <Select onValueChange={value => setFilters(f => ({ ...f, bloodGroup: value }))} value={filters.bloodGroup}>
                                <SelectTrigger className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex items-center justify-between mt-6">
                         <div className="flex items-center space-x-2">
                            <Switch id="active-cadets" checked={showActiveOnly} onCheckedChange={setShowActiveOnly} />
                            <Label htmlFor="active-cadets">Show Active Cadets Only (3 years)</Label>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleReset} className="bg-transparent hover:bg-black/10">Reset</Button>
                             <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets/new`}>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Cadet
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: cadetsPerPage }).map((_, index) => (
                        <Card key={index} className="bg-card shadow-lg backdrop-blur-lg border rounded-xl border-white/30 overflow-hidden">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <Skeleton className="h-6 w-3/4 mt-4"/>
                                <Skeleton className="h-4 w-1/2 mt-2"/>
                                <div className="flex justify-center gap-4 my-3 text-sm w-full">
                                    <Skeleton className="h-4 w-1/4"/>
                                    <Skeleton className="h-4 w-1/4"/>
                                    <Skeleton className="h-4 w-1/4"/>
                                </div>
                                <div className="flex gap-2 w-full mt-2">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 flex-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : currentCadets.map(cadet => (
                    <Card key={cadet.id} className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-lg border rounded-xl border-white/30 overflow-hidden">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            
                            <h3 className="text-lg font-semibold text-primary pt-4">{cadet.name}</h3>
                            <p className="text-sm text-muted-foreground">{cadet.regNo}</p>
                            <div className="flex justify-center gap-4 my-3 text-sm">
                                <div><span className="font-semibold">Rank:</span> {cadet.rank}</div>
                                <div><span className="font-semibold">Batch:</span> {cadet.batch}</div>
                                <div><span className="font-semibold">Blood:</span> {cadet.bloodGroup}</div>
                            </div>
                            <div className="flex gap-2 w-full mt-2">
                                <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets/${cadet.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full bg-transparent hover:bg-black/10">View</Button>
                                </Link>
                                <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets/${cadet.id}/edit`} className="flex-1">
                                    <Button variant="default" className="w-full">Edit</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCadets.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No cadets found matching your criteria.</p>
                </div>
            )}

             <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredCadets.length > 0 ? indexOfFirstCadet + 1 : 0}–{Math.min(indexOfLastCadet, filteredCadets.length)} of {filteredCadets.length} Cadets
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
