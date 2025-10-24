

'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { addCadet } from '@/lib/cadet-service';
import { getInstitutionByName } from '@/lib/institution-service';
import { useRouter } from 'next/navigation';
import { campTypes, campWithLevels } from '@/lib/constants';
import { Trash2, Upload } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { differenceInDays } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const initialCamp = {
    campType: '',
    level: '',
    location: '',
    startDate: '',
    endDate: '',
    durationDays: 0,
    reward: '',
    certificateUrl: '',
};

const initialCertificate = {
    certificate_type: '',
    certificate_grade: '',
    certificate_year: '',
};

export default function NewCadetPage({ params }: { params: { institutionName: string } }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const institutionName = decodeURIComponent(resolvedParams.institutionName);
    const [institutionType, setInstitutionType] = useState<'School' | 'College' | null>(null);

    const [formData, setFormData] = useState<any>({
        institutionName: institutionName,
        institution: 'College',
        regNo: '',
        rank: 'CDT',
        batch: new Date().getFullYear(),
        division: '',
        armytype: 'Army',

        Cadet_Name: '',
        Date_of_Birth: '',
        Cadet_Gender: 'MALE',
        Cadet_Mobile_No: '',
        Email_Address: '',
        Nationality: 'Indian',
        Identification_Mark: '',
        Blood_Group: 'O+',
        adhaarnumber: '',
        
        Father_s_Name: '',
        Mother_s_Name: '',
        
        House_No: '',
        Building_Name: '',
        Area: '',
        Permanent_Address_Pin_code: '',
        city: '',
        state: '',
        Permanent_Address_Nrs: '',

        Education_Qualification: '',
        institutetype: 'College',
        
        Medical_Complaint_if_any: '',
        
        NOK_Name: '',
        NOK_Relationship: '',
        NOK_Contact_Number: '',
        NOK_House_No: '',
        NOK_Building_Name: '',
        NOK_Area: '',
        NOK_Pincode: '',
        nokcity: '',
        nokstate: '',
        noknrs: '',
        
        Bank_Name: '',
        Bank_Account_Number: '',
        IFSC_Code: '',
        Account_Holder_Name: '',
        Bank_Branch: '',
        Bank_Pincode: '',

        Sports_Games: '',
        Co_Curricular_Activity: '',
        
        Willingness_to_undergo_Military_Training: null,
        Willingness_to_serve_in_NCC: null,
        Previously_Applied_for_enrollment: null,
        Dismissed_from_NCC_TA_AF: null,
        Criminal_Court: null,
        
        certificates: [] as any[],
        camps: [] as any[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        async function fetchInstitutionType() {
            const institution = await getInstitutionByName(institutionName);
            if (institution) {
                setInstitutionType(institution.type as 'School' | 'College');
                setFormData(prev => ({...prev, institution: institution.type, institutetype: institution.type }));
            }
        }
        fetchInstitutionType();
    }, [institutionName]);
    
    useEffect(() => {
        if (!institutionType) return;
        const { Cadet_Gender } = formData;
        let newDivision = '';
        if (institutionType === 'School') {
            newDivision = Cadet_Gender === 'MALE' ? 'JD' : 'JW';
        } else if (institutionType === 'College') {
            newDivision = Cadet_Gender === 'MALE' ? 'SD' : 'SW';
        }
        
        if (newDivision !== formData.division) {
            setFormData(prev => ({ ...prev, division: newDivision }));
        }
    }, [institutionType, formData.Cadet_Gender, formData.division]);

    const calculateDuration = useCallback((startDate: string, endDate: string) => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start <= end) {
                return differenceInDays(end, start) + 1;
            }
        }
        return 0;
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleCampChange = (index: number, field: string, value: string | number) => {
        const updatedCamps = [...formData.camps];
        updatedCamps[index] = { ...updatedCamps[index], [field]: value };
        
        if (field === 'startDate' || field === 'endDate') {
            const { startDate, endDate } = updatedCamps[index];
            updatedCamps[index].durationDays = calculateDuration(startDate, endDate);
        }

        if (field === 'campType') {
            updatedCamps[index].level = '';
        }

        setFormData(prev => ({ ...prev, camps: updatedCamps }));
    };
    
    const handleCertificateChange = (index: number, field: string, value: string) => {
        const updatedCertificates = [...formData.certificates];
        updatedCertificates[index] = { ...updatedCertificates[index], [field]: value };
        setFormData(prev => ({ ...prev, certificates: updatedCertificates }));
    };

    const addCertificate = () => {
        setFormData(prev => ({
            ...prev,
            certificates: [...prev.certificates, { ...initialCertificate }]
        }));
    };

    const removeCertificate = (index: number) => {
        setFormData(prev => ({
            ...prev,
            certificates: prev.certificates.filter((_, i) => i !== index)
        }));
    };


    const addCamp = () => {
        setFormData(prev => ({
            ...prev,
            camps: [...prev.camps, { ...initialCamp }]
        }));
    };

    const removeCamp = (index: number) => {
        setFormData(prev => ({
            ...prev,
            camps: prev.camps.filter((_, i) => i !== index)
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addCadet({...formData, institutionName: institutionName}, institutionName);
            router.push(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
        } catch (error) {
            console.error("Failed to add cadet", error);
            setIsSubmitting(false);
        }
    }
    
    const getCampLabel = (typeValue: string) => {
        const camp = campTypes.find(c => c.value === typeValue);
        return camp ? camp.label : typeValue;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Add New Cadet to {institutionName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">NCC Specific Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="regNo">Regimental No</Label>
                                    <Input id="regNo" value={formData.regNo} onChange={handleInputChange} className="mt-1 bg-white/20" required/>
                                </div>
                                <div>
                                    <Label htmlFor="rank">Rank</Label>
                                    <Select onValueChange={(value) => handleSelectChange('rank', value)} value={formData.rank}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['CDT', 'LCPL', 'CPL', 'SGT', 'CSM', 'JUO', 'SUO'].map(rank => <SelectItem key={rank} value={rank}>{rank}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="batch">Batch</Label>
                                    <Input id="batch" type="number" value={formData.batch} onChange={handleInputChange} className="mt-1 bg-white/20" required/>
                                </div>
                                 <div>
                                    <Label htmlFor="armytype">Army Type</Label>
                                    <Select onValueChange={(value) => handleSelectChange('armytype', value)} value={formData.armytype}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Army">Army</SelectItem>
                                            <SelectItem value="Navy">Navy</SelectItem>
                                            <SelectItem value="Air Force">Air Force</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="division">Division</Label>
                                    <Input id="division" value={formData.division} disabled className="mt-1 bg-gray-100/20" placeholder="Auto-assigned"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label>Willingness to undergo Military Training?</Label>
                                    <RadioGroup value={formData.Willingness_to_undergo_Military_Training} onValueChange={(value) => handleSelectChange('Willingness_to_undergo_Military_Training', value)} className="flex space-x-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="willing-yes" /><Label htmlFor="willing-yes">Yes</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="willing-no" /><Label htmlFor="willing-no">No</Label></div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-2">
                                    <Label>Willingness to serve in NCC?</Label>
                                    <RadioGroup value={formData.Willingness_to_serve_in_NCC} onValueChange={(value) => handleSelectChange('Willingness_to_serve_in_NCC', value)} className="flex space-x-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="serve-yes" /><Label htmlFor="serve-yes">Yes</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="serve-no" /><Label htmlFor="serve-no">No</Label></div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-2">
                                    <Label>Previously applied for enrollment?</Label>
                                    <RadioGroup value={formData.Previously_Applied_for_enrollment} onValueChange={(value) => handleSelectChange('Previously_Applied_for_enrollment', value)} className="flex space-x-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="applied-yes" /><Label htmlFor="applied-yes">Yes</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="applied-no" /><Label htmlFor="applied-no">No</Label></div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-2">
                                    <Label>Dismissed from NCC/TA/AF?</Label>
                                    <RadioGroup value={formData.Dismissed_from_NCC_TA_AF} onValueChange={(value) => handleSelectChange('Dismissed_from_NCC_TA_AF', value)} className="flex space-x-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="dismissed-yes" /><Label htmlFor="dismissed-yes">Yes</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="dismissed-no" /><Label htmlFor="dismissed-no">No</Label></div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h3 className="text-xl font-semibold text-primary/90">NCC Certificate Details</h3>
                                <Button type="button" variant="outline" onClick={addCertificate} className="bg-transparent hover:bg-black/10">
                                    Add Certificate
                                </Button>
                            </div>
                            {formData.certificates.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No certificates added. Click "Add Certificate" to begin.</p>
                            ) : (
                                <div className="space-y-4">
                                    {formData.certificates.map((cert, index) => (
                                        <div key={index} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 space-y-4 relative">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-primary/90">Certificate #{index + 1}</h4>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeCertificate(index)} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor={`cert_type_${index}`}>Certificate Type</Label>
                                                    <Select value={cert.certificate_type} onValueChange={(value) => handleCertificateChange(index, 'certificate_type', value)}>
                                                        <SelectTrigger id={`cert_type_${index}`} className="mt-1 bg-white/20"><SelectValue placeholder="Select Type" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="A Certificate">A Certificate</SelectItem>
                                                            <SelectItem value="B Certificate">B Certificate</SelectItem>
                                                            <SelectItem value="C Certificate">C Certificate</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`cert_grade_${index}`}>Grade Obtained</Label>
                                                    <Select value={cert.certificate_grade} onValueChange={(value) => handleCertificateChange(index, 'certificate_grade', value)}>
                                                        <SelectTrigger id={`cert_grade_${index}`} className="mt-1 bg-white/20"><SelectValue placeholder="Select Grade" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="A Grade">A Grade</SelectItem>
                                                            <SelectItem value="B Grade">B Grade</SelectItem>
                                                            <SelectItem value="C Grade">C Grade</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`cert_year_${index}`}>Year Attended</Label>
                                                    <Input id={`cert_year_${index}`} type="number" placeholder="YYYY" value={cert.certificate_year} onChange={(e) => handleCertificateChange(index, 'certificate_year', e.target.value)} className="mt-1 bg-white/20"/>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                        
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="Cadet_Name">Cadet Name</Label>
                                    <Input id="Cadet_Name" value={formData.Cadet_Name} onChange={handleInputChange} className="mt-1 bg-white/20" required/>
                                </div>
                                <div>
                                    <Label htmlFor="Date_of_Birth">Date of Birth</Label>
                                    <Input id="Date_of_Birth" type="date" value={formData.Date_of_Birth} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Cadet_Gender">Cadet Gender</Label>
                                    <Select onValueChange={(value) => handleSelectChange('Cadet_Gender', value)} value={formData.Cadet_Gender}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">MALE</SelectItem>
                                            <SelectItem value="FEMALE">FEMALE</SelectItem>
                                            <SelectItem value="OTHER">OTHER</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="Cadet_Mobile_No">Mobile No</Label>
                                    <Input id="Cadet_Mobile_No" type="tel" value={formData.Cadet_Mobile_No} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Email_Address">Email Address</Label>
                                    <Input id="Email_Address" type="email" value={formData.Email_Address} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Nationality">Nationality</Label>
                                    <Input id="Nationality" value={formData.Nationality} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Identification_Mark">Identification Mark</Label>
                                    <Input id="Identification_Mark" value={formData.Identification_Mark} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Blood_Group">Blood Group</Label>
                                     <Select onValueChange={(value) => handleSelectChange('Blood_Group', value)} value={formData.Blood_Group}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="adhaarnumber">Aadhaar Number</Label>
                                    <Input id="adhaarnumber" value={formData.adhaarnumber} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Family Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="Father_s_Name">Father's Name</Label>
                                    <Input id="Father_s_Name" value={formData.Father_s_Name} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Mother_s_Name">Mother's Name</Label>
                                    <Input id="Mother_s_Name" value={formData.Mother_s_Name} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Permanent Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="House_No">House No</Label>
                                    <Input id="House_No" value={formData.House_No} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Building_Name">Building Name</Label>
                                    <Input id="Building_Name" value={formData.Building_Name} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Area">Area</Label>
                                    <Input id="Area" value={formData.Area} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" value={formData.city} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" value={formData.state} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Permanent_Address_Pin_code">PIN Code</Label>
                                    <Input id="Permanent_Address_Pin_code" value={formData.Permanent_Address_Pin_code} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="Permanent_Address_Nrs">NRS (Near Road/Street)</Label>
                                    <Input id="Permanent_Address_Nrs" value={formData.Permanent_Address_Nrs} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                            </div>
                        </section>
                        
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Education & Medical</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="Education_Qualification">Education Qualification</Label>
                                    <Input id="Education_Qualification" value={formData.Education_Qualification} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="institution">Institution Type</Label>
                                    <Select onValueChange={(value) => handleSelectChange('institution', value)} value={formData.institution}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="College">College</SelectItem>
                                            <SelectItem value="School">School</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="institutetype">Institution Stream</Label>
                                    <Input id="institutetype" value={formData.institutetype} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div className="md:col-span-3">
                                    <Label htmlFor="Medical_Complaint_if_any">Medical Complaint (if any)</Label>
                                    <Textarea id="Medical_Complaint_if_any" value={formData.Medical_Complaint_if_any} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Bank Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="Account_Holder_Name">Account Holder Name</Label>
                                    <Input id="Account_Holder_Name" value={formData.Account_Holder_Name} onChange={handleInputChange} className="mt-1 bg-white/20" />
                                </div>
                                <div>
                                    <Label htmlFor="Bank_Name">Bank Name</Label>
                                    <Input id="Bank_Name" value={formData.Bank_Name} onChange={handleInputChange} className="mt-1 bg-white/20" />
                                </div>
                                <div>
                                    <Label htmlFor="Bank_Account_Number">Bank Account Number</Label>
                                    <Input id="Bank_Account_Number" value={formData.Bank_Account_Number} onChange={handleInputChange} className="mt-1 bg-white/20" />
                                </div>
                                <div>
                                    <Label htmlFor="IFSC_Code">IFSC Code</Label>
                                    <Input id="IFSC_Code" value={formData.IFSC_Code} onChange={handleInputChange} className="mt-1 bg-white/20" />
                                </div>
                                <div>
                                    <Label htmlFor="Bank_Branch">Bank Branch</Label>
                                    <Input id="Bank_Branch" value={formData.Bank_Branch} onChange={handleInputChange} className="mt-1 bg-white/20" />
                                </div>
                                <div>
                                    <Label htmlFor="Bank_Pincode">Bank Pincode</Label>
                                    <Input id="Bank_Pincode" value={formData.Bank_Pincode} onChange={handleInputChange} className="mt-1 bg-white/20" />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Next of Kin (NOK) Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="NOK_Name">NOK Name</Label>
                                    <Input id="NOK_Name" value={formData.NOK_Name} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="NOK_Relationship">NOK Relation</Label>
                                    <Input id="NOK_Relationship" value={formData.NOK_Relationship} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="NOK_Contact_Number">NOK Contact</Label>
                                    <Input id="NOK_Contact_Number" value={formData.NOK_Contact_Number} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="NOK_House_No">NOK House No</Label>
                                    <Input id="NOK_House_No" value={formData.NOK_House_No} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="NOK_Building_Name">NOK Building Name</Label>
                                    <Input id="NOK_Building_Name" value={formData.NOK_Building_Name} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="NOK_Area">NOK Area</Label>
                                    <Input id="NOK_Area" value={formData.NOK_Area} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="nokcity">NOK City</Label>
                                    <Input id="nokcity" value={formData.nokcity} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="nokstate">NOK State</Label>
                                    <Input id="nokstate" value={formData.nokstate} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="NOK_Pincode">NOK Pincode</Label>
                                    <Input id="NOK_Pincode" value={formData.NOK_Pincode} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="noknrs">NOK NRS (Near Road/Street)</Label>
                                    <Input id="noknrs" value={formData.noknrs} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Activities & Background</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="Sports_Games">Sports / Games</Label>
                                    <Textarea id="Sports_Games" value={formData.Sports_Games} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="Co_Curricular_Activity">Co-Curricular Activity</Label>
                                    <Textarea id="Co_Curricular_Activity" value={formData.Co_Curricular_Activity} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Any criminal court proceedings?</Label>
                                    <RadioGroup value={formData.Criminal_Court} onValueChange={(value) => handleSelectChange('Criminal_Court', value)} className="flex space-x-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="criminal-yes" /><Label htmlFor="criminal-yes">Yes</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="criminal-no" /><Label htmlFor="criminal-no">No</Label></div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Camp Details</h3>
                            <Accordion type="multiple" className="w-full" defaultValue={formData.camps.map((_:any, i:number) => `item-${i}`)}>
                                {formData.camps.map((camp, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <div className="flex items-center">
                                            <AccordionTrigger className="flex-1">
                                                <span>{camp.campType ? `${getCampLabel(camp.campType)} ${camp.level ? `- ${camp.level}`: ''}` : `Camp #${index + 1}`}</span>
                                            </AccordionTrigger>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCamp(index)} className="ml-2 text-destructive hover:bg-destructive/10 h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <AccordionContent>
                                            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`camp-type-${index}`}>Camp Type</Label>
                                                        <Select value={camp.campType} onValueChange={(value) => handleCampChange(index, 'campType', value)}>
                                                            <SelectTrigger id={`camp-type-${index}`} className="w-full mt-1 bg-white/20"><SelectValue placeholder="Select Camp Type" /></SelectTrigger>
                                                            <SelectContent>
                                                                {campTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    
                                                    { (campWithLevels as any)[camp.campType] && (
                                                        <div>
                                                            <Label htmlFor={`camp-level-${index}`}>Level</Label>
                                                             <Select value={camp.level} onValueChange={(value) => handleCampChange(index, 'level', value)}>
                                                                <SelectTrigger id={`camp-level-${index}`} className="w-full mt-1 bg-white/20"><SelectValue placeholder="Select Level" /></SelectTrigger>
                                                                <SelectContent>
                                                                    { (campWithLevels as any)[camp.campType].map((lvl: string) => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}

                                                    <div className={ (campWithLevels as any)[camp.campType] ? "md:col-span-2" : ""}>
                                                        <Label htmlFor={`camp-location-${index}`}>Location</Label>
                                                        <Input id={`camp-location-${index}`} placeholder="e.g., Trichy, Tamil Nadu" value={camp.location} onChange={(e) => handleCampChange(index, 'location', e.target.value)} className="mt-1 bg-white/20"/>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor={`camp-start-date-${index}`}>Start Date</Label>
                                                        <Input id={`camp-start-date-${index}`} type="date" value={camp.startDate} onChange={(e) => handleCampChange(index, 'startDate', e.target.value)} className="mt-1 bg-white/20"/>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`camp-end-date-${index}`}>End Date</Label>
                                                        <Input id={`camp-end-date-${index}`} type="date" value={camp.endDate} onChange={(e) => handleCampChange(index, 'endDate', e.target.value)} className="mt-1 bg-white/20"/>
                                                    </div>
                                                    
                                                    <div className="flex items-end">
                                                        <Label>Duration: {camp.durationDays || 0} days</Label>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <Label htmlFor={`camp-reward-${index}`}>Reward / Distinction (Optional)</Label>
                                                        <Input id={`camp-reward-${index}`} placeholder="e.g., Best Cadet – Army Wing" value={camp.reward} onChange={(e) => handleCampChange(index, 'reward', e.target.value)} className="mt-1 bg-white/20"/>
                                                    </div>
                                                     <div className="md:col-span-2">
                                                        <Label htmlFor={`camp-certificate-${index}`}>Certificate</Label>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Input id={`camp-certificate-url-${index}`} placeholder="Certificate URL" value={camp.certificateUrl} onChange={(e) => handleCampChange(index, 'certificateUrl', e.target.value)} className="bg-white/20"/>
                                                            <Button type="button" variant="outline" size="icon" className="bg-transparent" onClick={() => alert("File upload coming soon!")}>
                                                                <Upload className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            <Button type="button" variant="outline" onClick={addCamp} className="bg-transparent hover:bg-black/10 mt-4">
                                Add Another Camp
                            </Button>
                        </section>

                        <div className="flex justify-end gap-4 mt-8">
                           <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets`}>
                             <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                           </Link>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Cadet'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
