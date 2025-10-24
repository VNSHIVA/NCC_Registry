
'use client';
import { useEffect, useState } from 'react';
import { getDashboardStats, getFilteredCampStats, type DashboardStats } from '@/lib/dashboard-service';
import { StatsCards } from './_components/stats-cards';
import { DivisionPieChart } from './_components/division-pie-chart';
import { BatchBarChart } from './_components/batch-bar-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { campTypes } from '@/lib/constants';
import { FilteredCampStatsCard } from './_components/filtered-camp-stats-card';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        campType: '',
        division: '',
        institutionName: '',
    });
    const [filteredCampStats, setFilteredCampStats] = useState<{ count: number; total: number } | null>(null);
    const [isFiltering, setIsFiltering] = useState(false);


    const handleFilterChange = (field: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value === 'all' ? '' : value }));
    };

    const applyFilters = async () => {
        if (!filters.campType) {
            setFilteredCampStats(null);
            return;
        }

        setIsFiltering(true);
        const result = await getFilteredCampStats(filters);
        setFilteredCampStats({ count: result.filteredCadetCount, total: result.totalCadetCount });
        setIsFiltering(false);
    };

    const clearFilters = () => {
        setFilters({
            campType: '',
            division: '',
            institutionName: '',
        });
        setFilteredCampStats(null);
    };


    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            const initialData = await getDashboardStats();
            setStats(initialData);
            setInstitutions(initialData.institutions);
            setLoading(false);
        }

        fetchInitialData();

        const cadetsCol = collection(db, 'cadets');
        const institutionsCol = collection(db, 'institutions');
        
        const unsubCadets = onSnapshot(cadetsCol, async () => {
            const updatedStats = await getDashboardStats();
            setStats(updatedStats);
            if (filters.campType) applyFilters();
        });

        const unsubInstitutions = onSnapshot(institutionsCol, async () => {
            const updatedData = await getDashboardStats();
            setStats(updatedData);
            setInstitutions(updatedData.institutions);
        });

        return () => {
            unsubCadets();
            unsubInstitutions();
        };
    }, []); // Removed applyFilters from dependency array


    if (loading || !stats) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-9 w-64 mb-8" />
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20"><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-36 mt-1" /></CardContent></Card>
                    <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20"><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-36 mt-1" /></CardContent></Card>
                    <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20"><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-36 mt-1" /></CardContent></Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                    <Card className="lg:col-span-2 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                        <CardHeader><Skeleton className="h-6 w-56" /></CardHeader>
                        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
                    </Card>
                    <Card className="lg:col-span-3 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                        <CardHeader><Skeleton className="h-6 w-56" /></CardHeader>
                        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-primary mb-8">NCC Dashboard</h1>
            
            <StatsCards 
                totalCadets={stats.totalCadets}
                totalInstitutions={stats.totalInstitutions}
                averageCadetsPerInstitution={stats.averageCadetsPerInstitution}
            />

            <Card className="mt-8 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Camp Attendance Filters</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <Label htmlFor="camp-filter">Camp Type</Label>
                            <Select onValueChange={(value) => handleFilterChange('campType', value)} value={filters.campType}>
                                <SelectTrigger id="camp-filter" className="mt-1 bg-white/20"><SelectValue placeholder="Select a camp" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Camp</SelectItem>
                                    {campTypes.map(camp => <SelectItem key={camp.value} value={camp.value}>{camp.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="division-filter">Division</Label>
                            <Select onValueChange={(value) => handleFilterChange('division', value)} value={filters.division}>
                                <SelectTrigger id="division-filter" className="mt-1 bg-white/20"><SelectValue placeholder="All Divisions" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Divisions</SelectItem>
                                    <SelectItem value="SD">Senior Division (SD)</SelectItem>
                                    <SelectItem value="SW">Senior Wing (SW)</SelectItem>
                                    <SelectItem value="JD">Junior Division (JD)</SelectItem>
                                    <SelectItem value="JW">Junior Wing (JW)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="institution-filter">Institution</Label>
                            <Select onValueChange={(value) => handleFilterChange('institutionName', value)} value={filters.institutionName}>
                                <SelectTrigger id="institution-filter" className="mt-1 bg-white/20"><SelectValue placeholder="All Institutions" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Institutions</SelectItem>
                                    {institutions.map(inst => <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={applyFilters} disabled={isFiltering || !filters.campType}>
                                {isFiltering ? 'Filtering...' : 'Apply Filters'}
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>Clear</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredCampStats && (
                <div className="mt-8">
                    <FilteredCampStatsCard 
                        count={filteredCampStats.count} 
                        total={filteredCampStats.total}
                        campType={campTypes.find(c => c.value === filters.campType)?.label || filters.campType}
                    />
                </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <Card className="lg:col-span-2 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Cadet Division Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DivisionPieChart data={stats.divisionCounts} />
                    </CardContent>
                </Card>
                
                <Card className="lg:col-span-3 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Batch-wise Enrollment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BatchBarChart data={stats.batchCounts} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
