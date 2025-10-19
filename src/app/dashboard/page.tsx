
'use client';
import { useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard-service';
import { StatsCards } from './_components/stats-cards';
import { DivisionPieChart } from './_components/division-pie-chart';
import { BatchBarChart } from './_components/batch-bar-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cadetsCol = collection(db, 'cadets');
        const institutionsCol = collection(db, 'institutions');

        const unsubscribe = onSnapshot(cadetsCol, async () => {
            // Re-fetch stats whenever cadet data changes
            const updatedStats = await getDashboardStats();
            setStats(updatedStats);
            setLoading(false);
        });

        // Also listen for institution changes, though less frequent
        const unsubscribeInstitutions = onSnapshot(institutionsCol, async () => {
             const updatedStats = await getDashboardStats();
            setStats(updatedStats);
            setLoading(false);
        });

        // Initial fetch
        getDashboardStats().then(initialStats => {
            setStats(initialStats);
            setLoading(false);
        });

        // Cleanup listeners on component unmount
        return () => {
            unsubscribe();
            unsubscribeInstitutions();
        };
    }, []);

    if (loading || !stats) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-9 w-64 mb-8" />
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20"><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-36 mt-1" /></CardContent></Card>
                    <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20"><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-36 mt-1" /></CardContent></Card>
                    <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20"><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-36 mt-1" /></CardContent></Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                    <Card className="lg:col-span-2 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                        <CardHeader><Skeleton className="h-6 w-56" /></CardHeader>
                        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
                    </Card>
                    <Card className="lg:col-span-3 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                        <CardHeader><Skeleton className="h-6 w-56" /></CardHeader>
                        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-primary mb-8">NCC Dashboard</h1>
            
            <StatsCards 
                totalCadets={stats.totalCadets}
                totalInstitutions={stats.totalInstitutions}
                averageCadetsPerInstitution={stats.averageCadetsPerInstitution}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <Card className="lg:col-span-2 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Cadet Division Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DivisionPieChart data={stats.divisionCounts} />
                    </CardContent>
                </Card>
                
                <Card className="lg:col-span-3 bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Batch-wise Enrollment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BatchBarChart data={stats.batchCounts} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
