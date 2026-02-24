'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SessionTimer } from '@/components/auth/session-timer'

interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        name: 'Usuarios',
        href: '/admin/usuarios',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        name: 'Dispositivos',
        href: '/admin/dispositivos',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
        )
    },
    {
        name: 'Medios de Cultivo',
        href: '/admin/medios-cultivo',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        )
    },
    {
        name: 'Módulos',
        href: '/admin/modulos',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )
    }
]

interface AdminSidebarProps {
    className?: string
    isCollapsed?: boolean
    setIsCollapsed?: (collapsed: boolean) => void
}

export function AdminSidebar({ className = '', isCollapsed = false, setIsCollapsed }: AdminSidebarProps) {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-700 transition-colors"
                aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            <aside
                className={cn(
                    "fixed left-0 top-0 bottom-0 min-h-[100dvh] bg-white/80 backdrop-blur-xl border-r border-white/40 transition-all duration-300 z-50 flex flex-col shadow-2xl shadow-indigo-100/20",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    className
                )}
            >
                {/* Header */}
                <div className={cn("border-b border-white/40 transition-all flex items-center h-16 px-4", isCollapsed ? "justify-center" : "justify-between")}>
                    <Link href="/admin" className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity">
                        <div className="flex-shrink-0">
                            <Image
                                src="/icons/omnigrow_clean.png"
                                alt="OmniGrow Logo"
                                width={32}
                                height={32}
                                className="rounded-lg object-contain"
                            />
                        </div>
                        {!isCollapsed && (
                            <span className="font-black text-lg text-slate-900 whitespace-nowrap tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
                                OmniGrow
                            </span>
                        )}
                    </Link>

                    <button
                        onClick={() => setIsCollapsed?.(!isCollapsed)}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                    >
                        <svg
                            className={cn("w-5 h-5 transition-transform", isCollapsed ? 'rotate-180' : '')}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative overflow-hidden",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "text-slate-500 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm",
                                    isCollapsed ? "justify-center" : ""
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <div className={cn("transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500")}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && <span className="font-black text-[13px] uppercase tracking-tight">{item.name}</span>}
                            </Link>
                        )
                    })}

                    <div className="pt-2 mt-2 border-t border-slate-100">
                        <Link
                            href="/select-role"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-slate-500 hover:bg-slate-50 hover:text-indigo-600",
                                isCollapsed ? "justify-center" : ""
                            )}
                            title={isCollapsed ? 'Cambiar Rol' : undefined}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            {!isCollapsed && <span className="font-black text-[11px] uppercase tracking-widest">Cambiar Rol</span>}
                        </Link>
                    </div>
                </nav>

                {!isCollapsed && (
                    <div className="p-3 border-t border-slate-100 space-y-2">
                        <div className="px-3">
                            <SessionTimer />
                        </div>
                        <div className="text-[10px] text-slate-400 text-center font-black uppercase tracking-[0.2em] opacity-60">
                            <p>Sistema de Control</p>
                            <p className="mt-1">v1.2.0 PRO MAX</p>
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
