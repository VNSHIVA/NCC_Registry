'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { getCadet, updateCadet } from '@/lib/cadet-service';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { campTypes, nationalCampTypes } from '@/lib/constants';
import { Trash2 } from 'lucide-react';

const initialCamp = {
    type: '',
    level: '',
    location: '',
    startDate: '',
    endDate: '',
    days: 0,
    reward: ''
};

// Function to migrate old camp structure to the new one
const migrateCampsData = (data: any) => {
    if (!data.camps || Array.isArray(data.camps)) {
        // If camps is already an array or doesn't exist, assume it's new structure or empty
        if(!data.camps) data.camps = [];
        return data;
    }

    const newCamps: any[] = [];
    // Old atcCatc array
    if (data.camps.atcCatc && Array.isArray(data.camps.atcCatc)) {
        data.camps.atcCatc.forEach((camp: any) => {
            if(camp.location || camp.date) {
                newCamps.push({
                    type: 'CATC', // Defaulting to CATC for old data
                    level: '',
                    location: camp.location || '',
                    startDate: camp.date || '',
                    endDate: '',
                    reward: '',
                });
            }
        });
    }

    // Old nationalCamps array
    if (data.camps.nationalCamps && Array.isArray(data.camps.nationalCamps)) {
        data.camps.nationalCamps.forEach((camp: any) => {
             if(camp.location || camp.date) {
                newCamps.push({
                    type: 'NIC', // Defaulting to NIC as it's a national camp
                    level: '',
                    location: camp.location || '',
                    startDate: camp.date || '',
                    endDate: '',
                    reward: '',
                });
            }
        });
    }

    // Old tsc/rdc fields
    if (data.camps.tsc) {
        newCamps.push({ type: 'TSC', level: data.camps.tsc, location: '', startDate: '', endDate: '', reward: '' });
    }
    if (data.camps.rdc) {
        newCamps.push({ type: 'RDC', level: data.camps.rdc, location: '', startDate: '', endDate: '', reward: '' });
    }
    
    data.camps = newCamps;
    return data;
};


export default function EditCadetPage({ params }: { params: { institutionName: string, cadetId: string } }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const institutionName = decodeURIComponent(resolvedParams.institutionName);
    const cadetId = resolvedParams.cadetId;
    
    const [formData, setFormData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchCadet() {
            setLoading(true);
            let data = await getCadet(cadetId);
            if(data) {
                data = migrateCampsData(data);
                setFormData(data);
            }
            setLoading(false);
        }
        fetchCadet();
    }, [cadetId]);

    if (loading) {
        return (
             <div className="container mx-auto px-4 py-8">
                <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                         {Array.from({ length: 3 }).map((_, i) => (
                        <section key={i}>
                            <Skeleton className="h-6 w-1/3 mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-10 w-full" />)}
                            </div>
                        </section>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!formData) {
        return <div className="container mx-auto px-4 py-8">Cadet not found</div>
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev!, [id]: value }));
    }

    const handleSelectChange = (id: string, value: string) => {
        setFormData((prev: any) => ({ ...prev!, [id]: value }));
    }
    
    const handleCampChange = (index: number, field: string, value: string | number) => {
        const updatedCamps = [...formData.camps];
        updatedCamps[index] = { ...updatedCamps[index], [field]: value };
        setFormData(prev => ({ ...prev, camps: updatedCamps }));
    };

    const addCamp = () => {
        setFormData(prev => ({
            ...prev,
            camps: [...(prev.camps || []), { ...initialCamp }]
        }));
    };

    const removeCamp = (index: number) => {
        setFormData(prev => ({
            ...prev,
            camps: prev.camps.filter((_: any, i: number) => i !== index)
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Firestore doesn't like the 'id' field in the data object
            const { id, ...dataToUpdate } = formData;
            await updateCadet(cadetId, dataToUpdate, institutionName);
            router.push(`/institutions/${encodeURIComponent(institutionName)}/cadets/${cadetId}`);
        } catch (error) {
            console.error("Failed to update cadet", error);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Edit Cadet: {formData.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Details */}
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="regNo">Regimental No</Label>
                                    <Input id="regNo" value={formData.regNo} onChange={handleInputChange} className="mt-1 bg-white/20"/>
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
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={formData.name} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="batch">Batch</Label>
                                    <Input id="batch" type="number" value={formData.batch} onChange={handleInputChange} className="mt-1 bg-white/20" />
                                </div>
                                <div>
                                    <Label htmlFor="institution">Institution</Label>
                                    <Input id="institution" value={formData.institution} disabled className="mt-1 bg-gray-100/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input id="mobile" value={formData.mobile} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="education">Education Qualification</Label>
                                    <Input id="education" value={formData.education} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="bloodGroup">Blood Group</Label>
                                     <Select onValueChange={(value) => handleSelectChange('bloodGroup', value)} value={formData.bloodGroup}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="adhaar">Adhaar No</Label>
                                    <Input id="adhaar" value={formData.adhaar} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="homeAddress">Home Address</Label>
                                    <Textarea id="homeAddress" value={formData.homeAddress} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                 <div>
                                    <Label htmlFor="sportsCulturals">Any Sports/Culturals</Label>
                                    <Input id="sportsCulturals" value={formData.sportsCulturals} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                            </div>
                        </section>

                         {/* NOK Details */}
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Next of Kin (NOK) Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="nokName">NOK Name</Label>
                                    <Input id="nokName" value={formData.nokName} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="nokRelation">NOK Relation</Label>
                                    <Input id="nokRelation" value={formData.nokRelation} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                                <div>
                                    <Label htmlFor="nokContact">NOK Contact</Label>
                                    <Input id="nokContact" value={formData.nokContact} onChange={handleInputChange} className="mt-1 bg-white/20"/>
                                </div>
                            </div>
                        </section>
                        
                        {/* Camp Details */}
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Camp Details</h3>
                            <div className="space-y-6">
                                {formData.camps?.map((camp: any, index: number) => (
                                    <div key={index} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-primary/90">Camp #{index + 1}</h4>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCamp(index)} className="text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor={`camp-type-${index}`}>Camp Type</Label>
                                                <Select value={camp.type} onValueChange={(value) => handleCampChange(index, 'type', value)}>
                                                    <SelectTrigger id={`camp-type-${index}`} className="w-full mt-1 bg-white/20"><SelectValue placeholder="Select Camp Type" /></SelectTrigger>
                                                    <SelectContent>
                                                        {campTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor={`camp-location-${index}`}>Location</Label>
                                                <Input id={`camp-location-${index}`} placeholder="e.g., Trichy, Tamil Nadu" value={camp.location} onChange={(e) => handleCampChange(index, 'location', e.target.value)} className="mt-1 bg-white/20"/>
                                            </div>

                                            {nationalCampTypes.includes(camp.type) && (
                                                <div>
                                                    <Label htmlFor={`camp-level-${index}`}>Level</Label>
                                                    <Input id={`camp-level-${index}`} placeholder="e.g. Directorate / All-India" value={camp.level} onChange={(e) => handleCampChange(index, 'level', e.target.value)} className="mt-1 bg-white/20"/>
                                                </div>
                                            )}

                                            <div>
                                                <Label htmlFor={`camp-start-date-${index}`}>Start Date</Label>
                                                <Input id={`camp-start-date-${index}`} type="date" value={camp.startDate} onChange={(e) => handleCampChange(index, 'startDate', e.target.value)} className="mt-1 bg-white/20"/>
                                            </div>
                                            <div>
                                                <Label htmlFor={`camp-end-date-${index}`}>End Date</Label>
                                                <Input id={`camp-end-date-${index}`} type="date" value={camp.endDate} onChange={(e) => handleCampChange(index, 'endDate', e.target.value)} className="mt-1 bg-white/20"/>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor={`camp-reward-${index}`}>Reward / Distinction (Optional)</Label>
                                                <Input id={`camp-reward-${index}`} placeholder="e.g., Best Cadet – Army Wing" value={camp.reward} onChange={(e) => handleCampChange(index, 'reward', e.target.value)} className="mt-1 bg-white/20"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addCamp} className="bg-transparent hover:bg-black/10">
                                    Add Another Camp
                                </Button>
                            </div>
                        </section>


                        <div className="flex justify-end gap-4 mt-8">
                           <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets/${cadetId}`}>
                             <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                           </Link>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
