'use client'

import { useAuthContext } from '@/lib/auth/auth-context'
import { Sidebar } from './sidebar'
import { usePathname } from 'next/navigation'
import { SessionExpiryNotification } from '../auth/session-expiry-notification'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, selectedRole } = useAuthContext()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
        <div className="flex min-h-screen bg-white">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className={cn(
                "flex-1 transition-all duration-300",
                isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
            )}>
                {children}
            </main>
            <SessionExpiryNotification />
        </div>
    )
}
