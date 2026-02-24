import React from 'react'
import { LoadingSpinner } from './loading-spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    icon?: React.ReactNode
    fullWidth?: boolean
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-black uppercase tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50'

    const variantStyles = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 disabled:bg-indigo-400',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-500 disabled:bg-slate-50',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 disabled:bg-rose-400',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500'
    }

    const sizeStyles = {
        sm: 'px-4 py-2 text-[9px] gap-1.5',
        md: 'px-6 py-3 text-[10px] gap-2',
        lg: 'px-8 py-4 text-[12px] gap-2'
    }

    const widthStyles = fullWidth ? 'w-full' : ''

    return (
        <button
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyles}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" variant={variant === 'primary' || variant === 'danger' ? 'white' : 'gray'} />}
            {!loading && icon && <span>{icon}</span>}
            {children}
        </button>
    )
}
