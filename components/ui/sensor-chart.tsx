'use client';

import React from 'react';
// import dynamic from 'next/dynamic';

// Dynamically import Recharts components to strictly avoid SSR issues
// const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
// const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
// const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });

interface SensorChartProps {
    data?: { value: number; timestamp?: string }[];
    currentValue?: number;
    sensorType?: string;
    sensorId?: number;
    deviceId?: number;
    unit?: string;
    label?: string;
    timeRange?: string;
    color?: string;
    height?: number;
}

export function SensorChart({ data, color = '#10b981', height = 40 }: SensorChartProps) {
    // DISABLE RECHARTS FOR DEBUGGING
    return (
        <div style={{ height, width: '100%' }} className="bg-slate-50 rounded-md flex items-center justify-center border border-dashed border-slate-200">
            <span className="text-[9px] text-slate-400">Chart Disabled (Debug)</span>
        </div>
    );
    /*
        const [isMounted, setIsMounted] = React.useState(false);
    
        React.useEffect(() => {
            setIsMounted(true);
        }, []);
    
        // Placeholder during SSR and first client render
        if (!isMounted) return <div style={{ height, width: '100%' }} className="animate-pulse bg-slate-50/50 rounded-md" />;
    
        // Si no hay datos, mostramos un placeholder específico
        if (!data || data.length === 0) return (
            <div style={{ height, width: '100%' }} className="bg-slate-50/50 rounded-md flex items-center justify-center">
                 <span className="text-[10px] text-slate-300">Sin datos</span>
            </div>
        );
    
        return (
            <div style={{ height, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    */
}
