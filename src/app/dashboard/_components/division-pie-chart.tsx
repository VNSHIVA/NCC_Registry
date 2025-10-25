'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DivisionPieChartProps {
    data: { name: string; value: number; fill: string; }[];
}

export function DivisionPieChart({ data }: DivisionPieChartProps) {
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent * 100 < 5) return null; // Don't render label if slice is too small

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Tooltip
                    cursor={{fill: 'hsl(var(--accent) / 0.1)'}}
                    contentStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: '#FFFFFF' // ✅ Ensures tooltip text is white
                    }}
                    labelStyle={{ color: '#FFFFFF' }} // ✅ Makes label text white
                    itemStyle={{ color: '#FFFFFF' }}  // ✅ Makes item values white
                />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    dataKey="value"
                    stroke="hsl(var(--border))"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Legend iconSize={10} />
            </PieChart>
        </ResponsiveContainer>
    );
}
