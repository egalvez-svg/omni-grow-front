import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    variant?: 'default' | 'bordered' | 'elevated' | 'glass'
    onClick?: () => void
    hover?: boolean
}

interface CardHeaderProps {
    children: React.ReactNode
    className?: string
}

interface CardContentProps {
    children: React.ReactNode
    className?: string
}

interface CardFooterProps {
    children: React.ReactNode
    className?: string
}

export function Card({
    children,
    className = '',
    variant = 'default',
    onClick,
    hover
}: CardProps) {
    const baseStyles = 'bg-white rounded-lg'

    const variantStyles = {
        default: 'bg-white shadow-sm border border-slate-100',
        bordered: 'bg-white border border-slate-200',
        elevated: 'bg-white shadow-xl shadow-slate-200/50 border border-slate-100',
        glass: 'glass-panel'
    }

    const hoverStyles = (onClick || hover) ? 'hover-card cursor-pointer' : ''

    return (
        <div
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${hoverStyles}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    )
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    )
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>
            {children}
        </div>
    )
}
