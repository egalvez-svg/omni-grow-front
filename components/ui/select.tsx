import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    helperText?: string
    icon?: React.ReactNode
    fullWidth?: boolean
    variant?: 'default' | 'compact'
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({
        label,
        error,
        helperText,
        icon,
        fullWidth = false,
        className = '',
        disabled,
        children,
        variant = 'default',
        ...props
    }, ref) => {
        const hasError = !!error
        const isCompact = variant === 'compact'

        return (
            <div className={cn("space-y-1.5", fullWidth ? "w-full" : "")}>
                {label && (
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {label}
                    </label>
                )}

                <div className="relative group">
                    {icon && !isCompact && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            {icon}
                        </div>
                    )}

                    <select
                        ref={ref}
                        disabled={disabled}
                        className={cn(
                            "w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all",
                            isCompact ? "py-2 px-3 pr-8" : "py-3.5 pr-12",
                            "hover:border-slate-200 hover:bg-slate-100/50",
                            "focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100",
                            icon && !isCompact ? "pl-12" : (isCompact ? "pl-3" : "pl-6"),
                            hasError ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : "",
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </select>

                    <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors",
                        isCompact ? "right-2" : "right-4"
                    )}>
                        <ChevronDown className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
                    </div>
                </div>

                {error ? (
                    <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                ) : helperText && (
                    <p className="text-[10px] font-bold text-slate-400 ml-1">
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'
