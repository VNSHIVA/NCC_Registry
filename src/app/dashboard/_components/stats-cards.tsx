
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, BarChart } from 'lucide-react';

interface StatsCardsProps {
    totalCadets: number;
    totalInstitutions: number;
    averageCadetsPerInstitution: number;
}

export function StatsCards({ totalCadets, totalInstitutions, averageCadetsPerInstitution }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary/90">Total Cadets</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCadets}</div>
                    <p className="text-xs text-muted-foreground">Across all institutions</p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary/90">Total Institutions</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalInstitutions}</div>
                    <p className="text-xs text-muted-foreground">Currently enrolled in the program</p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 shadow-lg backdrop-blur-lg border rounded-xl border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary/90">Avg. Cadets / Institution</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{averageCadetsPerInstitution}</div>
                    <p className="text-xs text-muted-foreground">Average size of a unit</p>
                </CardContent>
            </Card>
        </div>
    );
}
