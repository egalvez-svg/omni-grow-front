import React from 'react'
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    unit?: string
    icon: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky'
    children?: React.ReactNode // For charts
}

export function StatCard({
    title,
    value,
    unit,
    icon: Icon,
    trend,
    trendValue,
    color = 'indigo',
    children
}: StatCardProps) {

    // Mapeo de colores para fondos y textos
    const colorStyles = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'from-indigo-500 to-indigo-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'from-emerald-400 to-emerald-600' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'from-rose-400 to-rose-600' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'from-amber-400 to-amber-600' },
        sky: { bg: 'bg-sky-50', text: 'text-sky-600', iconBg: 'from-sky-400 to-sky-600' },
    }

    const currentStyle = colorStyles[color]

    return (
        <Card variant="glass" className="relative overflow-hidden group">
            <div className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {title}
                        </p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                                {value}
                            </h3>
                            {unit && (
                                <span className="text-sm font-bold text-slate-400">{unit}</span>
                            )}
                        </div>
                    </div>

                    <div className={`
                        p-3 rounded-2xl shadow-lg shadow-slate-200/50 
                        bg-gradient-to-br ${currentStyle.iconBg} text-white
                        transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                    `}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                {/* Área para gráfico o tendencia */}
                <div className="mt-2 min-h-[40px] flex items-end justify-between">
                    {children ? (
                        <div className="w-full opacity-80 group-hover:opacity-100 transition-opacity">
                            {children}
                        </div>
                    ) : trend && (
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className={
                                trend === 'up' ? 'text-emerald-500' :
                                    trend === 'down' ? 'text-rose-500' : 'text-slate-400'
                            }>
                                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                            </span>
                            <span className="text-slate-300 uppercase text-[9px] tracking-wide">
                                vs. ayer
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Decoración de fondo */}
            <div className={`
                absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 
                ${currentStyle.bg.replace('bg-', 'bg-')}
                pointer-events-none transition-opacity group-hover:opacity-40
            `} />
        </Card>
    )
}
