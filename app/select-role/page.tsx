'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth/auth-context'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/types/api'

export default function SelectRolePage() {
    const router = useRouter()
    const { user, selectRole, isLoading, refreshUser, logout } = useAuthContext()
    const [isRefreshing, setIsRefreshing] = useState(true)

    // Refresh user data ONCE when page loads to get latest roles
    const [hasRefreshed, setHasRefreshed] = useState(false)

    useEffect(() => {
        if (!isLoading && user && !hasRefreshed) {
            setHasRefreshed(true)
            refreshUser().finally(() => {
                setIsRefreshing(false)
            })
        } else if (!isLoading && !user) {
            setIsRefreshing(false)
        }
    }, [isLoading, user, refreshUser, hasRefreshed])

    const handleRoleSelect = useCallback((role: Role) => {
        selectRole(role)
        // Redirect based on role
        const isAdmin = role.nombre.toLowerCase() === 'admin'
        router.push(isAdmin ? '/admin' : '/salas')
    }, [selectRole, router])

    // Auto-select if user has only one role
    useEffect(() => {
        const rolesCount = user?.roles?.length || 0

        if (!isLoading && !isRefreshing && user && rolesCount === 1) {
            const singleRole = user.roles[0]
            handleRoleSelect(singleRole)
        }
    }, [isLoading, isRefreshing, user, handleRoleSelect])

    if (isLoading || !user || isRefreshing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="lg" text={isRefreshing ? "Sincronizando..." : "Cargando..."} />
            </div>
        )
    }

    if (user.roles.length === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="lg" text="Redirigiendo..." />
            </div>
        )
    }

    const handleLogout = () => {
        logout()
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                        Bienvenido, {user.nombre}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Selecciona tu perfil de acceso para continuar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(user?.roles || []).map((role) => {
                        const isAdmin = role.nombre.toLowerCase() === 'admin'

                        return (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role)}
                                className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 p-10 text-center hover:-translate-y-2 active:scale-95 focus:outline-none overflow-hidden"
                            >
                                {/* Pro Max Decorative Blob */}
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-150 duration-700",
                                    isAdmin ? "bg-indigo-500/10" : "bg-sky-500/10"
                                )} />

                                {/* Icon */}
                                <div className="mb-6 flex justify-center relative z-10">
                                    <div className={cn(
                                        "w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-6",
                                        isAdmin
                                            ? "bg-slate-900 text-white shadow-slate-900/20"
                                            : "bg-indigo-600 text-white shadow-indigo-600/20"
                                    )}>
                                        {isAdmin ? (
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                                        {role.nombre}
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {isAdmin
                                            ? 'Gestión total de infraestructura y usuarios'
                                            : 'Control de cultivos y superficies'}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Logout Button */}
                <div className="mt-12 text-center">
                    <button
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-slate-900 text-[11px] font-black uppercase tracking-widest transition-all hover:tracking-[0.15em]"
                    >
                        ← Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    )
}
