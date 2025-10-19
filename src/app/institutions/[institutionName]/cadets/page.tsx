
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, ChevronLeft, ChevronRight, PlusCircle, Upload, Download } from 'lucide-react';
import Link from 'next/link';
import { getCadets } from '@/lib/cadet-service';
import { Skeleton } from '@/components/ui/skeleton';
import { CadetImportDialog } from '@/components/cadet-import-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { format, parseISO, differenceInDays } from 'date-fns';
import { campTypes } from '@/lib/constants';


export default function CadetsPage({ params }: { params: { institutionName: string } }) {
    const resolvedParams = React.use(params);
    const institutionName = decodeURIComponent(resolvedParams.institutionName);
    
    const [cadetsData, setCadetsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ batch: 'all', rank: 'all', bloodGroup: 'all', division: 'all' });
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const cadetsPerPage = 9;
    const [isImporting, setIsImporting] = useState(false);
    const [selectedCadets, setSelectedCadets] = useState<string[]>([]);
    const { toast } = useToast();
    const [exportConfirm, setExportConfirm] = useState<{ show: boolean, type: 'selected' | 'all' }>({ show: false, type: 'all' });


    async function fetchCadets() {
        setLoading(true);
        const cadets = await getCadets(institutionName);
        setCadetsData(cadets);
        setLoading(false);
    }

    useEffect(() => {
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
            (filters.division === 'all' || cadet.division === filters.division) &&
            (!showActiveOnly || isActive) 
        );
    });
    
    const indexOfLastCadet = currentPage * cadetsPerPage;
    const indexOfFirstCadet = indexOfLastCadet - cadetsPerPage;
    const currentCadets = filteredCadets.slice(indexOfFirstCadet, indexOfLastCadet);

    const totalPages = Math.ceil(filteredCadets.length / cadetsPerPage);

    const handleReset = () => {
        setSearchTerm('');
        setFilters({ batch: 'all', rank: 'all', bloodGroup: 'all', division: 'all' });
        setShowActiveOnly(true);
        setCurrentPage(1);
        setSelectedCadets([]);
    }
    
    const toggleSelectCadet = (id: string) => {
        setSelectedCadets(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleToggleAll = () => {
        if (selectedCadets.length === currentCadets.length && currentCadets.length > 0) {
            setSelectedCadets([]);
        } else {
            setSelectedCadets(currentCadets.map(c => c.id));
        }
    };

    const formatDateForExport = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy');
        } catch (e) {
            return dateString;
        }
    }
    
    const getCampLabel = (typeValue: string) => {
        const camp = campTypes.find(c => c.value === typeValue);
        return camp ? camp.label : typeValue;
    }
    
    const formatDataForExport = (data: any[]) => {
        // First, find all unique camps across all cadets to create dynamic headers
        const allCamps = new Set<string>();
        data.forEach(cadet => {
            if (cadet.camps && cadet.camps.length > 0) {
                cadet.camps.forEach((camp: any) => {
                    const campIdentifier = `${getCampLabel(camp.campType)}${camp.level ? ` - ${camp.level}` : ''}`;
                    if (campIdentifier) allCamps.add(campIdentifier);
                });
            }
        });
        const uniqueCamps = Array.from(allCamps);

        const baseHeaders = [
            'Regimental No', 'Rank', 'CDT Name', 'Batch', 'Division', 'Institution', 'Date of Birth',
            'Mobile', 'Email', 'Educational Qualification', 'Blood Group', 'Aadhaar No', 'Home Address',
            'Any Sports / Culturals', 'NOK Name', 'NOK Relation', 'NOK Contact'
        ];

        const campHeaders: string[] = [];
        uniqueCamps.forEach(campName => {
            campHeaders.push(`${campName} - Location`, `${campName} - Start Date`, `${campName} - End Date`, `${campName} - Duration`, `${campName} - Reward`);
        });

        const headers = [...baseHeaders, ...campHeaders];
        
        const exportData = data.map(cadet => {
            const row: any = {
                'Regimental No': cadet.regNo || '',
                'Rank': cadet.rank || '',
                'CDT Name': cadet.name || '',
                'Batch': cadet.batch || '',
                'Division': cadet.division || '',
                'Institution': cadet.institution || '',
                'Date of Birth': cadet.dob ? formatDateForExport(cadet.dob) : '',
                'Mobile': cadet.mobile || '',
                'Email': cadet.email || '',
                'Educational Qualification': cadet.education || '',
                'Blood Group': cadet.bloodGroup || '',
                'Aadhaar No': cadet.adhaar || '',
                'Home Address': cadet.homeAddress || '',
                'Any Sports / Culturals': cadet.sportsCulturals || '',
                'NOK Name': cadet.nokName || '',
                'NOK Relation': cadet.nokRelation || '',
                'NOK Contact': cadet.nokContact || '',
            };

            if (cadet.camps && cadet.camps.length > 0) {
                cadet.camps.forEach((camp: any) => {
                    const campIdentifier = `${getCampLabel(camp.campType)}${camp.level ? ` - ${camp.level}` : ''}`;
                    if (campIdentifier) {
                        const duration = (camp.startDate && camp.endDate)
                            ? differenceInDays(new Date(camp.endDate), new Date(camp.startDate)) + 1
                            : (camp.durationDays || '');
                        
                        row[`${campIdentifier} - Location`] = camp.location || '';
                        row[`${campIdentifier} - Start Date`] = camp.startDate ? formatDateForExport(camp.startDate) : '';
                        row[`${campIdentifier} - End Date`] = camp.endDate ? formatDateForExport(camp.endDate) : '';
                        row[`${campIdentifier} - Duration`] = duration;
                        row[`${campIdentifier} - Reward`] = camp.reward || '';
                    }
                });
            }
            return row;
        });

        return exportData;
    };


    const exportToExcel = (data: any[], fileName: string) => {
        if (data.length === 0) {
            toast({
                title: "Export Failed",
                description: "No data available to export.",
                variant: "destructive"
            });
            return;
        }
        const formattedData = formatDataForExport(data);
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cadets");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        
        const finalFileName = `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        saveAs(blob, finalFileName);
        
        toast({
            title: "Export Successful",
            description: `${data.length} cadet records are being exported to ${finalFileName}`,
        });
    };

    const handleConfirmExport = () => {
        const { type } = exportConfirm;
        setExportConfirm({ show: false, type: 'all' });
    
        if (type === 'selected') {
            const selectedData = cadetsData.filter(c => selectedCadets.includes(c.id));
            exportToExcel(selectedData, `Selected_Cadets_${institutionName.replace(/\s+/g, '_')}`);
        } else {
            exportToExcel(filteredCadets, `All_Cadets_${institutionName.replace(/\s+/g, '_')}`);
        }
    };
    
    const batchYears = [...new Set(cadetsData.map(c => c.batch).filter(Boolean))].sort((a,b) => b - a);


    return (
        <div className="container mx-auto px-4 py-8">
            <CadetImportDialog
                isOpen={isImporting}
                onClose={() => setIsImporting(false)}
                onImportSuccess={fetchCadets}
                institutionName={institutionName}
            />

            <AlertDialog open={exportConfirm.show} onOpenChange={(open) => !open && setExportConfirm({show: false, type: 'all'})}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to export the {exportConfirm.type === 'selected' ? `${selectedCadets.length} selected` : 'filtered'} cadet details to Excel?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmExport}>Confirm & Export</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <Card className="mb-8 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
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
                                <SelectTrigger id="blood-group-filter" className="mt-1 bg-white/20"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                         <div className="flex items-center space-x-2">
                            <Switch id="active-cadets" checked={showActiveOnly} onCheckedChange={setShowActiveOnly} />
                            <Label htmlFor="active-cadets">Show Active Cadets Only (3 years)</Label>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={handleReset} className="bg-transparent hover:bg-black/10">Reset</Button>
                             <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets/new`} className="w-full sm:w-auto">
                                <Button className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="border-t border-white/20 my-6"></div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                         <div className="flex items-center space-x-2">
                            <Checkbox
                                id="select-all-toggle"
                                checked={selectedCadets.length > 0 && currentCadets.length > 0 && selectedCadets.length === currentCadets.length}
                                onCheckedChange={handleToggleAll}
                                aria-label="Select all cadets on current page"
                            />
                            <Label htmlFor="select-all-toggle" className="text-sm font-medium">
                                {selectedCadets.length > 0 ? `${selectedCadets.length} cadet(s) selected` : "Select cadets to export"}
                            </Label>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                           <Button variant="outline" onClick={() => setIsImporting(true)} className="w-full sm:w-auto bg-transparent hover:bg-black/10">
                                <Upload className="mr-2 h-4 w-4" /> Import Cadets
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-black/10">
                                        <Download className="mr-2 h-4 w-4" /> Export Data
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setExportConfirm({ show: true, type: 'selected' })} disabled={selectedCadets.length === 0}>
                                        Export Selected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setExportConfirm({ show: true, type: 'all' })}>
                                        Export All Filtered
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: cadetsPerPage }).map((_, index) => (
                        <Card key={index} className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20 overflow-hidden">
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
                    <Card key={cadet.id} className="bg-card/80 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-lg border rounded-xl border-white/20 overflow-hidden">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                             <div className="absolute top-4 left-4">
                                <Checkbox
                                    checked={selectedCadets.includes(cadet.id)}
                                    onCheckedChange={() => toggleSelectCadet(cadet.id)}
                                    aria-label={`Select ${cadet.name}`}
                                />
                            </div>
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

    