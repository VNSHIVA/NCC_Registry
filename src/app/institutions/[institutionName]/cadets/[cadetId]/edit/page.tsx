'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

// Mock data, in a real app this would come from a database
const cadetsData = [
    { id: 1, name: 'Aarav Sharma', regNo: 'TN21SDA123456', rank: 'CDT', batch: 2022, bloodGroup: 'O+', institution: "St. Joseph's College", dob: '2004-05-15', mobile: '9876543210', email: 'aarav.sharma@example.com', education: 'B.Sc. Physics', nokName: 'Suresh Sharma', nokRelation: 'Father', nokContact: '9876543211', sportsCulturals: 'Cricket', homeAddress: '123, Main Street, Trichy', adhaar: '123456789012', camps: { atcCatc: [{ date: '2023-06-10', location: 'Trichy' }], nationalCamps: [], tsc: null, rdc: null } },
    { id: 2, name: 'Diya Patel', regNo: 'TN21SWA123457', rank: 'LCPL', batch: 2022, bloodGroup: 'A+', institution: "St. Joseph's College", dob: '2004-08-22', mobile: '9876543212', email: 'diya.patel@example.com', education: 'B.Com', nokName: 'Ramesh Patel', nokRelation: 'Father', nokContact: '9876543213', sportsCulturals: 'Bharatanatyam', homeAddress: '456, North Street, Trichy', adhaar: '234567890123', camps: { atcCatc: [{ date: '2023-06-10', location: 'Trichy' }], nationalCamps: [], tsc: null, rdc: null } },
    { id: 3, name: 'Arjun Singh', regNo: 'TN21SDA123458', rank: 'SGT', batch: 2021, bloodGroup: 'B+', institution: 'National Institute of Technology', dob: '2003-02-10', mobile: '9876543214', email: 'arjun.singh@example.com', education: 'B.E. Mech', nokName: 'Vikram Singh', nokRelation: 'Father', nokContact: '9876543215', sportsCulturals: 'Football', homeAddress: '789, West Street, Trichy', adhaar: '345678901234', camps: { atcCatc: [], nationalCamps: [{ date: '2022-10-05', location: 'Delhi' }], tsc: 'TSC-I', rdc: null } },
];


export default function EditCadetPage({ params }: { params: { institutionName: string, cadetId: string } }) {
    const institutionName = decodeURIComponent(params.institutionName);
    const cadetId = params.cadetId;
    const cadet = cadetsData.find(c => c.id === parseInt(cadetId));
    
    // In a real app, you would have a form state management library like react-hook-form
    // For simplicity, we'll use simple useState here.
    const [formData, setFormData] = useState(cadet);

    if (!formData) {
        return <div className="container mx-auto px-4 py-8">Cadet not found</div>
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev!, [id]: value }));
    }

    const handleSelectChange = (id: string, value: string) => {
        const updatedValue = value === 'none' ? null : value;
        setFormData(prev => ({ ...prev!, [id]: updatedValue }));
    }
    
    const handleCampChange = (campType: 'atcCatc' | 'nationalCamps', index: number, field: 'date' | 'location', value: string) => {
        setFormData(prev => {
            const newCamps = { ...prev!.camps };
            (newCamps[campType][index] as any)[field] = value;
            return { ...prev!, camps: newCamps };
        });
    }

    const addCamp = (campType: 'atcCatc' | 'nationalCamps') => {
        setFormData(prev => {
            const newCamps = { ...prev!.camps };
            newCamps[campType].push({ date: '', location: '' });
            return { ...prev!, camps: newCamps };
        });
    }

    const removeCamp = (campType: 'atcCatc' | 'nationalCamps', index: number) => {
        setFormData(prev => {
            const newCamps = { ...prev!.camps };
            newCamps[campType].splice(index, 1);
            return { ...prev!, camps: newCamps };
        });
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to your backend API to save it.
        console.log('Updated Cadet Data:', formData);
        alert('Cadet details saved successfully! (Check console for data)');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="bg-card shadow-lg backdrop-blur-lg border rounded-xl border-white/30">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Edit Cadet: {cadet?.name}</CardTitle>
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
                                {formData.camps.atcCatc.map((camp, index) => (
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
                                {formData.camps.nationalCamps.map((camp, index) => (
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
                                <Button type="button" variant="outline" size="sm" onClick={() => addCamp('nationalCamps')}>Add National Camp</Button>
                            </div>
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
                           <Link href={`/institutions/${encodeURIComponent(institutionName)}/cadets`}>
                             <Button type="button" variant="outline">Cancel</Button>
                           </Link>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
