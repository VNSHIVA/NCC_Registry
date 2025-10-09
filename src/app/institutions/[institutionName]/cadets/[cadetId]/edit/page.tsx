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
            const data = await getCadet(cadetId);
            if(data) {
                // Ensure camps data is properly initialized
                if (!data.camps) {
                    data.camps = { atcCatc: [], nationalCamps: [], tsc: null, rdc: null };
                } else {
                    if (!data.camps.atcCatc) data.camps.atcCatc = [];
                    if (!data.camps.nationalCamps) data.camps.nationalCamps = [];
                }
                setFormData(data);
            }
            setLoading(false);
        }
        fetchCadet();
    }, [cadetId]);

    if (loading) {
        return (
             <div className="container mx-auto px-4 py-8">
                <Card className="bg-card shadow-lg backdrop-blur-lg border rounded-xl border-white/30">
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
        const updatedValue = value === 'none' ? null : value;
        if (id === 'tsc' || id === 'rdc') {
            setFormData((prev: any) => ({
                ...prev,
                camps: { ...prev.camps, [id]: updatedValue }
            }));
        } else {
             setFormData((prev: any) => ({ ...prev!, [id]: value }));
        }
    }
    
    const handleCampChange = (campType: 'atcCatc' | 'nationalCamps', index: number, field: 'date' | 'location', value: string) => {
        setFormData((prev: any) => {
            const newCamps = { ...prev.camps };
            const updatedCamps = [...newCamps[campType]];
            updatedCamps[index] = { ...updatedCamps[index], [field]: value };
            return { ...prev, camps: { ...newCamps, [campType]: updatedCamps } };
        });
    }

    const addCamp = (campType: 'atcCatc' | 'nationalCamps') => {
        setFormData((prev: any) => {
            const newCamps = { ...prev.camps };
            const updatedCamps = [...newCamps[campType], { date: '', location: '' }];
            return { ...prev, camps: { ...newCamps, [campType]: updatedCamps } };
        });
    }

    const removeCamp = (campType: 'atcCatc' | 'nationalCamps', index: number) => {
        setFormData((prev: any) => {
            const newCamps = { ...prev.camps };
            const updatedCamps = [...newCamps[campType]];
            updatedCamps.splice(index, 1);
            return { ...prev, camps: { ...newCamps, [campType]: updatedCamps } };
        });
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Firestore doesn't like the 'id' field in the data object
            const { id, ...dataToUpdate } = formData;
            await updateCadet(cadetId, dataToUpdate, institutionName);
            // Optionally show success toast
            router.push(`/institutions/${encodeURIComponent(institutionName)}/cadets/${cadetId}`);
        } catch (error) {
            console.error("Failed to update cadet", error);
            // Optionally show error toast
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="bg-card shadow-lg backdrop-blur-lg border rounded-xl border-white/30">
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
                             {/* ATC/CATC */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-2">ATC / CATC</h4>
                                {formData.camps.atcCatc.map((camp: any, index: number) => (
                                    <div key={index} className="flex items-end gap-4 mb-2 p-2 border rounded-md">
                                        <div className="flex-1">
                                            <Label htmlFor={`atcDate-${index}`}>Date Attended</Label>
                                            <Input id={`atcDate-${index}`} type="date" value={camp.date} onChange={(e) => handleCampChange('atcCatc', index, 'date', e.target.value)} className="mt-1 bg-white/20" />
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor={`atcLocation-${index}`}>Location</Label>
                                            <Input id={`atcLocation-${index}`} value={camp.location} onChange={(e) => handleCampChange('atcCatc', index, 'location', e.target.value)} className="mt-1 bg-white/20" />
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeCamp('atcCatc', index)}>Remove</Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addCamp('atcCatc')}>Add ATC/CATC</Button>
                            </div>
                            {/* National Camps */}
                             <div className="mb-6">
                                <h4 className="font-semibold mb-2">National Camps</h4>
                                {formData.camps.nationalCamps.map((camp: any, index: number) => (
                                    <div key={index} className="flex items-end gap-4 mb-2 p-2 border rounded-md">
                                        <div className="flex-1">
                                            <Label htmlFor={`nationalDate-${index}`}>Date Attended</Label>
                                            <Input id={`nationalDate-${index}`} type="date" value={camp.date} onChange={(e) => handleCampChange('nationalCamps', index, 'date', e.target.value)} className="mt-1 bg-white/20" />
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor={`nationalLocation-${index}`}>Location</Label>
                                            <Input id={`nationalLocation-${index}`} value={camp.location} onChange={(e) => handleCampChange('nationalCamps', index, 'location', e.target.value)} className="mt-1 bg-white/20" />
                                        </div>
                                         <Button type="button" variant="destructive" size="sm" onClick={() => removeCamp('nationalCamps', index)}>Remove</Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addCamp('nationalCamps')}>Add National Camp</Button>                            </div>
                            {/* TSC / RDC */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="tsc">TSC - Levels</Label>
                                    <Select onValueChange={(value) => handleSelectChange('tsc', value)} value={formData.camps.tsc || 'none'}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue placeholder="None" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="TSC-I">TSC - I</SelectItem>
                                            <SelectItem value="TSC-II">TSC - II</SelectItem>
                                            <SelectItem value="TSC-F">TSC - Finals</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="rdc">RDC - Levels</Label>
                                     <Select onValueChange={(value) => handleSelectChange('rdc', value)} value={formData.camps.rdc || 'none'}>
                                        <SelectTrigger className="mt-1 bg-white/20"><SelectValue placeholder="None" /></SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="RDC-I">RDC - I</SelectItem>
                                            <SelectItem value="RDC-II">RDC - II</SelectItem>
                                            <SelectItem value="RDC-F">RDC - Finals</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
