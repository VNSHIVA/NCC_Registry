
import { getDashboardStats } from '@/lib/dashboard-service';
import { StatsCards } from './_components/stats-cards';
import { DivisionPieChart } from './_components/division-pie-chart';
import { BatchBarChart } from './_components/batch-bar-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function DashboardPage() {
    const stats = await getDashboardStats();

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
