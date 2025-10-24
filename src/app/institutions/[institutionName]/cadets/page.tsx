

'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, ChevronLeft, ChevronRight, PlusCircle, Upload, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getCadets, deleteCadets } from '@/lib/cadet-service';
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { format, parseISO, differenceInDays } from 'date-fns';
import { campTypes } from '@/lib/constants';


export default function CadetsPage({ params }: { params: { institutionName: string } }) {
    const resolvedParams = React.use(params);
    const institutionName = decodeURIComponent(resolvedParams.institutionName);
    
    const [cadetsData, setCadetsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ batch: 'all', rank: 'all', bloodGroup: 'all', division: 'all', camp: 'all', attendance: 'attended' });
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const cadetsPerPage = 9;
    const [isImporting, setIsImporting] = useState(false);
    const [selectedCadets, setSelectedCadets] = useState<string[]>([]);
    const { toast } = useToast();
    const [exportConfirm, setExportConfirm] = useState<{ show: boolean, type: 'selected' | 'all' }>({ show: false, type: 'all' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, type: 'selected' | 'all' }>({ show: false, type: 'all' });
    const [isSelectionMode, setIsSelectionMode] = useState(false);


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
            campFilterMatch &&
            (!showActiveOnly || isActive) 
        );
    });
    
    const indexOfLastCadet = currentPage * cadetsPerPage;
    const indexOfFirstCadet = indexOfLastCadet - cadetsPerPage;
    const currentCadets = filteredCadets.slice(indexOfFirstCadet, indexOfLastCadet);

    const totalPages = Math.ceil(filteredCadets.length / cadetsPerPage);

    // Reset selection when filters change
    useEffect(() => {
        setSelectedCadets([]);
        setIsSelectionMode(false);
    }, [searchTerm, filters, showActiveOnly]);
    
    useEffect(() => {
        setSelectedCadets([]);
    }, [currentPage]);


    const handleReset = () => {
        setSearchTerm('');
        setFilters({ batch: 'all', rank: 'all', bloodGroup: 'all', division: 'all', camp: 'all', attendance: 'attended' });
        setShowActiveOnly(true);
        setCurrentPage(1);
        setSelectedCadets([]);
        setIsSelectionMode(false);
    }
    
    const toggleSelectCadet = (id: string) => {
        setSelectedCadets(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleToggleAllOnPage = () => {
        const allCurrentIds = currentCadets.map(c => c.id);
        const allOnPageSelected = allCurrentIds.every(id => selectedCadets.includes(id));
        
        if (allOnPageSelected) {
             setSelectedCadets(prev => prev.filter(id => !allCurrentIds.includes(id)));
        } else {
            setSelectedCadets(prev => [...new Set([...prev, ...allCurrentIds])]);
        }
    };
    
    const handleSelectAllFiltered = () => {
        const allFilteredIds = filteredCadets.map(c => c.id);
        setSelectedCadets(allFilteredIds);
    };
    
    const handleDeselectAll = () => {
        setSelectedCadets([]);
    }

    // When toggling selection mode off, clear selections
    const handleSelectionModeChange = (checked: boolean) => {
        setIsSelectionMode(checked);
        if (!checked) {
            setSelectedCadets([]);
        }
    }


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
            'Regimental No', 'Rank', 'Cadet Name', 'Batch', 'Division', 'Institution Name', 'Institution', 'Date of Birth',
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
                'Cadet Name': cadet.Cadet_Name || '',
                'Batch': cadet.batch || '',
                'Division': cadet.division || '',
                'Institution Name': cadet.institutionName || '',
                'Institution': cadet.institution || '',
                'Date of Birth': cadet.Date_of_Birth ? formatDateForExport(cadet.Date_of_Birth) : '',
                'Mobile': cadet.Cadet_Mobile_No || '',
                'Email': cadet.Email_Address || '',
                'Educational Qualification': cadet.Education_Qualification || '',
                'Blood Group': cadet.Blood_Group || '',
                'Aadhaar No': cadet.adhaarnumber || '',
                'Home Address': `${cadet.House_No || ''} ${cadet.Building_Name || ''} ${cadet.Area || ''} ${cadet.city || ''} ${cadet.state || ''} ${cadet.Permanent_Address_Pin_code || ''}`.trim(),
                'Any Sports / Culturals': cadet.Sports_Games || '',
                'NOK Name': cadet.NOK_Name || '',
                'NOK Relation': cadet.NOK_Relationship || '',
                'NOK Contact': cadet.NOK_Contact_Number || '',
            };

            uniqueCamps.forEach(campIdentifier => {
                 row[`${campIdentifier} - Location`] = '';
                 row[`${campIdentifier} - Start Date`] = '';
                 row[`${campIdentifier} - End Date`] = '';
                 row[`${campIdentifier} - Duration`] = '';
                 row[`${campIdentifier} - Reward`] = '';
            });

            if (cadet.camps && cadet.camps.length > 0) {
                cadet.camps.forEach((camp: any) => {
                    const campIdentifier = `${getCampLabel(camp.campType)}${camp.level ? ` - ${camp.level}` : ''}`;
                    if (campIdentifier && uniqueCamps.includes(campIdentifier)) {
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
    
    const handleConfirmDelete = async () => {
        const { type } = deleteConfirm;
        setDeleteConfirm({ show: false, type: 'all' });
        
        let idsToDelete: string[] = [];
        let count = 0;

        if (type === 'selected') {
            idsToDelete = selectedCadets;
            count = selectedCadets.length;
        } else {
            idsToDelete = filteredCadets.map(c => c.id);
            count = filteredCadets.length;
        }
        
        if (idsToDelete.length === 0) {
            toast({ title: "No cadets to delete", variant: "destructive" });
            return;
        }

        try {
            await deleteCadets(idsToDelete, institutionName);
            toast({ title: "Success", description: `${count} cadet(s) deleted successfully.` });
            setSelectedCadets([]);
            fetchCadets(); // Refresh data
        } catch (error) {
            console.error("Failed to delete cadets:", error);
            toast({ title: "Error", description: "Failed to delete cadets.", variant: "destructive" });
        }
    };
    
    const batchYears = [...new Set(cadetsData.map(c => c.batch).filter(Boolean))].sort((a,b) => b - a);
    const allOnPageSelected = currentCadets.length > 0 && currentCadets.every(c => selectedCadets.includes(c.id));
    const allFilteredSelected = selectedCadets.length === filteredCadets.length && filteredCadets.length > 0;

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
                        Do you want to export {exportConfirm.type === 'selected' ? `${selectedCadets.length} selected` : `${filteredCadets.length} filtered`} cadet records to Excel?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmExport}>Confirm & Export</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={deleteConfirm.show} onOpenChange={(open) => !open && setDeleteConfirm({show: false, type: 'all'})}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. You are about to permanently delete {deleteConfirm.type === 'selected' ? `${selectedCadets.length} selected` : `${filteredCadets.length} filtered`} cadet(s).
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} variant="destructive">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


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
                         <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="selection-mode-toggle"
                                    checked={isSelectionMode}
                                    onCheckedChange={handleSelectionModeChange}
                                />
                                <Label htmlFor="selection-mode-toggle" className="text-sm font-medium">Select cadets</Label>
                            </div>
                            {isSelectionMode && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="select-all-toggle"
                                        checked={allOnPageSelected}
                                        onCheckedChange={handleToggleAllOnPage}
                                        aria-label="Select all cadets on current page"
                                    />
                                    <Label htmlFor="select-all-toggle" className="text-sm font-medium">
                                        Select all on page
                                    </Label>
                                </div>
                            )}
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
                                        Export Selected ({selectedCadets.length})
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setExportConfirm({ show: true, type: 'all' })} disabled={filteredCadets.length === 0}>
                                        Export All Filtered ({filteredCadets.length})
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="destructive" className="w-full sm:w-auto" disabled={!isSelectionMode || selectedCadets.length === 0}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Cadets
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setDeleteConfirm({ show: true, type: 'selected' })} disabled={selectedCadets.length === 0} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                        Delete Selected ({selectedCadets.length})
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setDeleteConfirm({ show: true, type: 'all' })} disabled={filteredCadets.length === 0} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                        Delete All Filtered ({filteredCadets.length})
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                     {isSelectionMode && (
                        <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm text-center">
                            {allFilteredSelected ? (
                                <span>All {selectedCadets.length} cadets matching filters are selected. <Button variant="link" className="p-0 h-auto" onClick={handleDeselectAll}>Deselect all</Button></span>
                            ) : (
                                <span>{selectedCadets.length} cadets selected. <Button variant="link" className="p-0 h-auto" onClick={handleSelectAllFiltered}>Select all {filteredCadets.length} matching cadets</Button></span>
                            )}
                        </div>
                     )}
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
                    <Card key={cadet.id} className="bg-card/80 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-lg border rounded-xl border-white/20 overflow-hidden relative">
                         {isSelectionMode && (
                            <div className="absolute top-4 left-4 z-10">
                                <Checkbox
                                    checked={selectedCadets.includes(cadet.id)}
                                    onCheckedChange={() => toggleSelectCadet(cadet.id)}
                                    aria-label={`Select ${cadet.name}`}
                                />
                            </div>
                        )}
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <h3 className="text-lg font-semibold text-primary pt-4">{cadet.Cadet_Name}</h3>
                            <p className="text-sm text-muted-foreground">{cadet.regNo}</p>
                            <div className="flex justify-center gap-4 my-3 text-sm">
                                <div><span className="font-semibold">Rank:</span> {cadet.rank}</div>
                                <div><span className="font-semibold">Batch:</span> {cadet.batch}</div>
                                <div><span className="font-semibold">Blood:</span> {cadet.Blood_Group}</div>
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

    

    