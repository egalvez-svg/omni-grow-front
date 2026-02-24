'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth/auth-context'
import { AdminSidebar } from '@/components/admin'
import { DashboardHeader } from '@/components/dashboard'
import { LoadingSpinner } from '@/components/ui'
import { SessionExpiryNotification } from '@/components/auth/session-expiry-notification'
import { cn } from '@/lib/utils'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, selectedRole, isLoading, isAuthenticated } = useAuthContext()
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            // Not authenticated, redirect to login
            if (!isAuthenticated) {
                router.push('/login')
                return
            }

            // Authenticated but no role selected, redirect to role selection
            if (!selectedRole) {
                router.push('/select-role')
                return
            }

            const isAdmin = selectedRole.nombre.toLowerCase() === 'admin'
            if (!isAdmin) {
                router.push('/')
            }
        }
    }, [isAuthenticated, isLoading, selectedRole, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
                <LoadingSpinner size="xl" text="Verificando permisos..." />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (!selectedRole) {
        return null
    }

    const isAdmin = selectedRole.nombre.toLowerCase() === 'admin'
    if (!isAdmin) {
        return null
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50 relative">
            <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn(
                "flex-1 flex flex-col overflow-hidden transition-all duration-300",
                isCollapsed ? "lg:pl-28" : "lg:pl-80"
            )}>
                <DashboardHeader title="Panel de Administración" />

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
            <SessionExpiryNotification />
        </div>
    )
}
