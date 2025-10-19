
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Loader2, FileWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { importCadets } from '@/lib/import-service';

const REQUIRED_FIELDS = ['regNo', 'name', 'batch'];

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any[] | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setCsvUrl('');
            setError(null);
            setParsedData(null);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCsvUrl(e.target.value);
        setFile(null);
        setError(null);
        setParsedData(null);
    };

    const processAndValidateData = (data: any[]): any[] | null => {
        if (data.length === 0) {
            setError("The file is empty or could not be parsed.");
            return null;
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
        const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));

        if (missingFields.length > 0) {
            setError(`The imported data is missing required columns: ${missingFields.join(', ')}.`);
            return null;
        }
        
        setError(null);
        return normalizedData;
    };
    
    const handleInitiateImport = async () => {
        if (!file && !csvUrl) {
            setError("Please select a file or provide a URL.");
            return;
        }
        
        setIsLoading(true);
        setError(null);

        const parsePromise = new Promise<any[]>((resolve, reject) => {
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result;
                        if (typeof data !== 'string' && !data) return reject(new Error("File is empty."));
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet);
                        resolve(json);
                    } catch (err) {
                        reject(new Error("Failed to parse the file. Ensure it's a valid Excel or CSV."));
                    }
                };
                reader.onerror = () => reject(new Error("Error reading the file."));
                reader.readAsBinaryString(file);
            } else if (csvUrl) {
                Papa.parse(csvUrl, {
                    download: true,
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (err) => reject(new Error(`Failed to parse Google Sheet URL: ${err.message}`)),
                });
            }
        });

        try {
            const rawData = await parsePromise;
            const validatedData = processAndValidateData(rawData);
            if (validatedData) {
                setParsedData(validatedData);
                setShowConfirmDialog(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleImportConfirm = async () => {
        if (!parsedData || parsedData.length === 0) {
             toast({
                title: 'Import Failed',
                description: 'No valid data to import.',
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
                    description: `${result.count} cadet records have been imported/updated.`,
                });
                onImportSuccess();
                handleClose();
            } else {
                 throw new Error(result.error || 'An unknown error occurred during import.');
            }
        } catch (err: any) {
            toast({
                title: 'Import Failed',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
            setShowConfirmDialog(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setCsvUrl('');
        setError(null);
        setParsedData(null);
        setIsLoading(false);
        setShowConfirmDialog(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-xl bg-card/90 backdrop-blur-lg">
                <DialogHeader>
                    <DialogTitle>Import Cadet Details</DialogTitle>
                    <DialogDescription>
                        Upload an Excel (.xlsx, .xls) or CSV file, or provide a public Google Sheets CSV link.
                        Required columns: {REQUIRED_FIELDS.join(', ')}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="file" className="mt-4">
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
                
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <FileWarning className="h-4 w-4" />
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
                            <AlertDialogDescription>
                                {`Ready to import ${parsedData?.length || 0} cadet records. Do you want to proceed?`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLoading} onClick={() => setParsedData(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleImportConfirm} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm & Import
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleInitiateImport} disabled={isLoading || (!file && !csvUrl)}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Import Cadets
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
