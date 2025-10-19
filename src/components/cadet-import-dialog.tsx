'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { importCadets } from '@/lib/import-service';

const REQUIRED_FIELDS = ['regNo', 'name', 'batch'];

// Field mapping from common spreadsheet headers to our Firestore schema
const FIELD_MAPPING: { [key: string]: string } = {
    'regimental no': 'regNo',
    'regimental number': 'regNo',
    'reg no': 'regNo',
    'rank': 'rank',
    'full name': 'name',
    'name': 'name',
    'batch': 'batch',
    'year': 'batch',
    'dob': 'dob',
    'date of birth': 'dob',
    'mobile': 'mobile',
    'mobile no': 'mobile',
    'mobile number': 'mobile',
    'email': 'email',
    'email id': 'email',
    'blood group': 'bloodGroup',
    'home address': 'homeAddress',
    'address': 'homeAddress',
    'nok name': 'nokName',
    'next of kin name': 'nokName',
    'nok relation': 'nokRelation',
    'next of kin relation': 'nokRelation',
    'nok contact': 'nokContact',
    'next of kin contact': 'nokContact',
    'adhaar': 'adhaar',
    'adhaar no': 'adhaar',
    'aadhar': 'adhaar',
    'education': 'education',
    'education qualification': 'education',
    'sports/culturals': 'sportsCulturals',
    'sports': 'sportsCulturals',
};

const normalizeHeaders = (header: string) => FIELD_MAPPING[header.toLowerCase().trim()] || header.trim();

type CadetImportDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
    institutionName: string;
};

export function CadetImportDialog({ isOpen, onClose, onImportSuccess, institutionName }: CadetImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [csvUrl, setCsvUrl] = useState('');
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [tableHeaders, setTableHeaders] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setCsvUrl(''); // Reset URL if file is selected
            setError(null);
            setParsedData([]);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCsvUrl(e.target.value);
        setFile(null); // Reset file if URL is entered
        setError(null);
        setParsedData([]);
    };

    const processData = (data: any[]) => {
        if (data.length === 0) {
            setError("The file is empty or could not be parsed.");
            return;
        }

        const normalizedData = data.map(row => {
            const newRow: { [key: string]: any } = {};
            for (const key in row) {
                const normalizedKey = normalizeHeaders(key);
                newRow[normalizedKey] = row[key];
            }
            return newRow;
        });

        const headers = Object.keys(normalizedData[0]);
        setTableHeaders(headers);
        
        let missingFields = false;
        for (const field of REQUIRED_FIELDS) {
            if (!headers.includes(field)) {
                missingFields = true;
                break;
            }
        }

        if (missingFields) {
            setError(`The imported data is missing one or more required columns. Please ensure your file has columns for: ${REQUIRED_FIELDS.join(', ')}.`);
        } else {
             setError(null);
        }

        setParsedData(normalizedData);
    };

    const handleParse = async () => {
        setIsLoading(true);
        setError(null);
        setParsedData([]);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    if (typeof data !== 'string' && !data) return;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    processData(json);
                } catch (err) {
                    setError("Failed to parse the file. Please ensure it is a valid Excel or CSV file.");
                } finally {
                    setIsLoading(false);
                }
            };
            reader.onerror = () => {
                setError("Error reading the file.");
                setIsLoading(false);
            };
            reader.readAsBinaryString(file);
        } else if (csvUrl) {
            Papa.parse(csvUrl, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processData(results.data);
                    setIsLoading(false);
                },
                error: (err) => {
                    setError(`Failed to fetch or parse the Google Sheet URL. ${err.message}`);
                    setIsLoading(false);
                }
            });
        } else {
            setError("Please select a file or provide a URL.");
            setIsLoading(false);
        }
    };

    const handleImportConfirm = async () => {
        if (error || parsedData.length === 0) {
             toast({
                title: 'Import Failed',
                description: 'Cannot import due to errors or no data. Please fix the issues and try again.',
                variant: 'destructive'
            });
            return;
        }
        setIsLoading(true);
        try {
            const result = await importCadets(parsedData, institutionName);
            if(result.success) {
                toast({
                    title: 'Import Successful',
                    description: `${result.count} cadet records have been successfully imported/updated.`,
                });
                onImportSuccess();
                handleClose();
            } else {
                 throw new Error(result.error || 'An unknown error occurred.');
            }
        } catch (err: any) {
            toast({
                title: 'Import Failed',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setCsvUrl('');
        setParsedData([]);
        setTableHeaders([]);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl bg-card/90 backdrop-blur-lg">
                <DialogHeader>
                    <DialogTitle>Import Cadet Details</DialogTitle>
                    <DialogDescription>
                        Upload an Excel (.xlsx, .xls) or CSV file, or provide a public Google Sheets CSV link.
                        Required columns: {REQUIRED_FIELDS.join(', ')}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="file">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">Upload File</TabsTrigger>
                        <TabsTrigger value="url">From Google Sheet URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="file">
                        <div className="grid gap-2 py-4">
                            <Label htmlFor="file-upload">Select File</Label>
                            <Input id="file-upload" type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="bg-white/20"/>
                        </div>
                    </TabsContent>
                    <TabsContent value="url">
                        <div className="grid gap-2 py-4">
                            <Label htmlFor="csv-url">Google Sheets CSV URL</Label>
                            <Input id="csv-url" type="url" placeholder="Paste published CSV link here" value={csvUrl} onChange={handleUrlChange} className="bg-white/20"/>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <Button onClick={handleParse} disabled={isLoading || (!file && !csvUrl)}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Parse and Preview
                </Button>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <FileWarning className="h-4 w-4" />
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {parsedData.length > 0 && !error && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Data Preview ({parsedData.length} records)</h4>
                        <ScrollArea className="h-64 w-full rounded-md border bg-black/10">
                            <Table className="whitespace-nowrap">
                                <TableHeader>
                                    <TableRow>
                                        {tableHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.slice(0, 20).map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {tableHeaders.map(header => <TableCell key={`${rowIndex}-${header}`}>{String(row[header] ?? '')}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                        {parsedData.length > 20 && <p className="text-sm text-muted-foreground mt-2">Showing first 20 records for preview.</p>}
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleImportConfirm} disabled={isLoading || parsedData.length === 0 || !!error}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm and Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
