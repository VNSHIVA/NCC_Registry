'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { addCadet } from '@/lib/cadet-service';
import { useRouter } from 'next/navigation';
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

export default function NewCadetPage({ params }: { params: { institutionName: string } }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const institutionName = decodeURIComponent(resolvedParams.institutionName);

    const [formData, setFormData] = useState({
        institution: institutionName,
        name: '',
        regNo: '',
        rank: 'CDT',
        batch: new Date().getFullYear(),
        bloodGroup: 'O+',
        dob: '',
        mobile: '',
        email: '',
        education: '',
        nokName: '',
        nokRelation: '',
        nokContact: '',
        sportsCulturals: '',
        homeAddress: '',
        adhaar: '',
        camps: [] as any[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setFormData(prev => ({ ...prev, camps: updatedCamps }));
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
            await addCadet(formData, institutionName);
            router.push(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
        } catch (error) {
            console.error("Failed to add cadet", error);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Add New Cadet</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Details */}
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-primary/90 border-b pb-2">Personal Details</h3>
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
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={formData.name} onChange={handleInputChange} className="mt-1 bg-white/20" required/>
                                </div>
                                 <div>
                                    <Label htmlFor="batch">Batch</Label>
                                    <Input id="batch" type="number" value={formData.batch} onChange={handleInputChange} className="mt-1 bg-white/20" required/>
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
                                {formData.camps.map((camp, index) => (
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
