'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/lib/auth/auth-context'
import { Sidebar } from './sidebar'
import { usePathname } from 'next/navigation'
import { SessionExpiryNotification } from '../auth/session-expiry-notification'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, selectedRole } = useAuthContext()
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Solo mostrar el Sidebar cuando:
    // 1. Está autenticado
    // 2. El rol seleccionado es 'user' (el admin tiene su propio sidebar en su layout)
    // 3. No estamos en rutas excluidas (login, selección de rol, admin)
    const isUserRole = selectedRole?.nombre.toLowerCase() === 'user'
    const isExcludedPath =
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/select-role') ||
        pathname?.startsWith('/admin')

    const showSidebar = isAuthenticated && isUserRole && !isExcludedPath

    if (isLoading) {
        return <>{children}</>
    }

    if (!showSidebar) {
        return (
            <>
                {children}
                <SessionExpiryNotification />
            </>
        )
    }

    return (
        <div className="flex min-h-screen bg-transparent">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={cn(
                "flex-1 transition-all duration-300 p-[var(--space-md)]",
                isCollapsed ? "lg:pl-28" : "lg:pl-80"
            )}>
                {children}
            </main>
            <SessionExpiryNotification />
        </div>
    )
}
