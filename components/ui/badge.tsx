import React from 'react'

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'neon' | 'soft'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant
    children: React.ReactNode
}

export function Badge({
    className = '',
    variant = 'default',
    children,
    ...props
}: BadgeProps) {

    const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

    const variants = {
        default: 'border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-700',
        secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
        destructive: 'border-transparent bg-rose-500 text-white shadow hover:bg-rose-600',
        outline: 'text-slate-900 border border-slate-200',
        success: 'border-transparent bg-emerald-500 text-white shadow hover:bg-emerald-600',
        warning: 'border-transparent bg-amber-500 text-white shadow hover:bg-amber-600',
        info: 'border-transparent bg-sky-500 text-white shadow hover:bg-sky-600',

        // New Eco-Tech Variants
        neon: 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)] backdrop-blur-sm',
        soft: 'border-transparent bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
    }

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
