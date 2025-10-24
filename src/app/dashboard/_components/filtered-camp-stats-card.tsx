
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Tent } from 'lucide-react';

interface FilteredCampStatsCardProps {
    count: number;
    total: number;
    campType: string;
}

export function FilteredCampStatsCard({ count, total, campType }: FilteredCampStatsCardProps) {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

    return (
        <Card className="bg-accent/20 shadow-lg backdrop-blur-lg border rounded-xl border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-accent-foreground">Filtered Camp Attendance</CardTitle>
                <Tent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">For: <span className="font-semibold">{campType}</span></p>
                <div className="text-2xl font-bold">{count} Cadets</div>
                <p className="text-xs text-muted-foreground">
                    Out of {total} total cadets in the current filter ({percentage}%)
                </p>
            </CardContent>
        </Card>
    );
}
