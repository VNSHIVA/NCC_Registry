
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BatchBarChartProps {
    data: { name: string; total: number; }[];
}

export function BatchBarChart({ data }: BatchBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground) / 0.7)" />
                <YAxis stroke="hsl(var(--foreground) / 0.7)" />
                <Tooltip 
                    cursor={{fill: 'hsl(var(--accent) / 0.1)'}}
                    contentStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                />
                <Legend />
                <Bar dataKey="total" name="Cadets Enrolled" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
