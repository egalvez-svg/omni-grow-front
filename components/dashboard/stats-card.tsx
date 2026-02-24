import React from 'react'
import { Card, CardContent } from '@/components/ui'

export type StatsVariant = 'blue' | 'green' | 'red' | 'yellow' | 'gray'

interface StatsCardProps {
    title: string
    value: string | number
    variant?: StatsVariant
    loading?: boolean
    icon?: string
    className?: string
}

export function StatsCard({
    title,
    value,
    variant = 'blue',
    loading = false,
    icon,
    className = ''
}: StatsCardProps) {
    const variantStyles = {
        blue: {
            text: 'text-sky-700',
            bg: 'bg-sky-50',
            border: 'border-sky-100',
            dot: 'bg-sky-400'
        },
        green: {
            text: 'text-emerald-700',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            dot: 'bg-emerald-400'
        },
        red: {
            text: 'text-rose-700',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            dot: 'bg-rose-400'
        },
        yellow: {
            text: 'text-amber-700',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            dot: 'bg-amber-400'
        },
        gray: {
            text: 'text-slate-700',
            bg: 'bg-slate-50',
            border: 'border-slate-100',
            dot: 'bg-slate-400'
        }
    }

    const style = variantStyles[variant]

    return (
        <Card className={`rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative ${className}`}>
            {/* Pro Max Decorative Blob */}
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${variant === 'blue' ? 'from-sky-500/20 to-indigo-500/10' : variant === 'green' ? 'from-emerald-500/20 to-teal-500/10' : 'from-indigo-500/20 to-emerald-500/10'} rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-150 duration-500`} />
            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest truncate">
                                {title}
                            </h3>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className={`text-3xl font-black tracking-tight ${style.text}`}>
                                {loading ? '...' : value}
                            </p>
                        </div>
                    </div>
                    {icon && (
                        <div className={`w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center text-2xl shadow-sm`}>
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
