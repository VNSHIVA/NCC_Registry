
'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';

// Define the shape of division counts
interface DivisionCounts {
    SD: number;
    SW: number;
    JD: number;
    JW: number;
}

// Define the shape of batch counts
interface BatchCounts {
    [batch: string]: number;
}

// Define the shape of the full dashboard statistics
export interface DashboardStats {
    totalCadets: number;
    totalInstitutions: number;
    averageCadetsPerInstitution: number;
    divisionCounts: { name: string; value: number; fill: string; }[];
    batchCounts: { name: string; total: number; }[];
}


export async function getDashboardStats(): Promise<DashboardStats> {
    const cadetsCol = collection(db, 'cadets');
    const institutionsCol = collection(db, 'institutions');

    // Get all cadets and institutions in parallel
    const [cadetSnapshot, institutionsSnapshot] = await Promise.all([
        getDocs(cadetsCol),
        getCountFromServer(institutionsCol)
    ]);
    
    const cadets = cadetSnapshot.docs.map(doc => doc.data());
    const totalCadets = cadets.length;
    const totalInstitutions = institutionsSnapshot.data().count;

    // Initialize counters
    const divisionCounts: DivisionCounts = { SD: 0, SW: 0, JD: 0, JW: 0 };
    const batchCounts: BatchCounts = {};

    // Process each cadet
    for (const cadet of cadets) {
        // Count divisions
        const division = cadet.division?.toUpperCase() || 'SD'; // Default to SD if not specified
        if (division in divisionCounts) {
            divisionCounts[division as keyof DivisionCounts]++;
        }

        // Count batches
        const batch = cadet.batch?.toString() || 'Unknown';
        if (batch) {
            batchCounts[batch] = (batchCounts[batch] || 0) + 1;
        }
    }
    
    // Format for chart components
    const formattedDivisionCounts = [
        { name: 'Senior Division (SD)', value: divisionCounts.SD, fill: 'hsl(var(--chart-1))' },
        { name: 'Senior Wing (SW)', value: divisionCounts.SW, fill: 'hsl(var(--chart-2))' },
        { name: 'Junior Division (JD)', value: divisionCounts.JD, fill: 'hsl(var(--chart-3))' },
        { name: 'Junior Wing (JW)', value: divisionCounts.JW, fill: 'hsl(var(--chart-4))' },
    ];
    
    const formattedBatchCounts = Object.entries(batchCounts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    return {
        totalCadets,
        totalInstitutions,
        averageCadetsPerInstitution: totalInstitutions > 0 ? Math.round(totalCadets / totalInstitutions) : 0,
        divisionCounts: formattedDivisionCounts,
        batchCounts: formattedBatchCounts,
    };
}
