'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const cadetsData = [
    { id: 1, name: 'Aarav Sharma', regNo: 'TN21SDA123456', rank: 'CDT', batch: 2022, bloodGroup: 'O+' },
    { id: 2, name: 'Diya Patel', regNo: 'TN21SWA123457', rank: 'LCPL', batch: 2022, bloodGroup: 'A+' },
    { id: 3, name: 'Arjun Singh', regNo: 'TN21SDA123458', rank: 'SGT', batch: 2021, bloodGroup: 'B+' },
    { id: 4, name: 'Priya Kumar', regNo: 'TN21SWA123459', rank: 'CDT', batch: 2023, bloodGroup: 'AB+' },
    { id: 5, name: 'Rohan Gupta', regNo: 'TN21SDA123460', rank: 'CPL', batch: 2021, bloodGroup: 'O-' },
    { id: 6, name: 'Sneha Reddy', regNo: 'TN21SWA123461', rank: 'CSM', batch: 2020, bloodGroup: 'B-' },
    { id: 7, name: 'Vikram Yadav', regNo: 'TN21SDA123462', rank: 'SUO', batch: 2020, bloodGroup: 'A-' },
    { id: 8, name: 'Ananya Iyer', regNo: 'TN21SWA123463', rank: 'JUO', batch: 2021, bloodGroup: 'AB-' },
    { id: 9, name: 'Karan Malhotra', regNo: 'TN21SDA123464', rank: 'LCPL', batch: 2023, bloodGroup: 'O+' },
    { id: 10, name: 'Meera Menon', regNo: 'TN21SWA123465', rank: 'CDT', batch: 2022, bloodGroup: 'A+' },
    { id: 11, name: 'Suresh Pillai', regNo: 'TN21SDA123466', rank: 'SGT', batch: 2021, bloodGroup: 'B+' },
];

export default function CadetsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ batch: 'all', rank: 'all', bloodGroup: 'all' });
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const cadetsPerPage = 10;

    const filteredCadets = cadetsData.filter(cadet => {
        return (
            cadet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filters.batch === 'all' || cadet.batch.toString() === filters.batch) &&
            (filters.rank === 'all' || cadet.rank === filters.rank) &&
            (filters.bloodGroup === 'all' || cadet.bloodGroup === filters.bloodGroup) &&
            (!showActiveOnly || (new Date().getFullYear() - cadet.batch) <= 3) // Assuming 'active' means within 3 years
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
                                    {[2020, 2021, 2022, 2023].map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
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
                            <Label htmlFor="active-cadets">Show Active Cadets Only</Label>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleReset} className="bg-transparent hover:bg-black/10">Reset</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCadets.map(cadet => (
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
                                <Button variant="outline" className="flex-1 bg-transparent hover:bg-black/10">View</Button>
                                <Button variant="default" className="flex-1">Edit</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-muted-foreground">
                    Showing {indexOfFirstCadet + 1}–{Math.min(indexOfLastCadet, filteredCadets.length)} of {filteredCadets.length} Cadets
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                     <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
