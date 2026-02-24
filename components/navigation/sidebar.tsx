'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Home,
    Sprout,
    Database,
    Settings,
    ChevronRight,
    Menu,
    X,
    ThermometerSun,
    PackageSearch,
    Dna,
    LogOut
} from 'lucide-react'
import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/lib/auth/auth-context'
import { SessionTimer } from '@/components/auth/session-timer'

const menuItems = [
    {
        title: 'Principal',
        items: [
            { name: 'Mis Salas', href: '/salas', icon: Home },
            { name: 'Dispositivos', href: '/', icon: LayoutDashboard, slug: 'dispositivos' },
        ]
    },
    {
        title: 'Cultivos',
        items: [
            { name: 'Cultivos', href: '/cultivos', icon: Sprout },
        ]
    },
    {
        title: 'Catálogos',
        items: [
            { name: 'Variedades', href: '/catalogos/variedades', icon: Dna },
            { name: 'Productos', href: '/catalogos/productos', icon: PackageSearch },
        ]
    },
    {
        title: 'Hardware',
        items: [
            { name: 'Administración', href: '/dispositivos', icon: ThermometerSun },
        ]
    }
]

interface SidebarProps {
    isCollapsed?: boolean
    setIsCollapsed?: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed = false, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuthContext()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Mobile Drawer doesn't need effect for initial state as it's always closed

    // Memoize the filtered items to prevent unnecessary re-calculations and rendering issues
    const filteredMenuItems = React.useMemo(() => {
        return menuItems.map(section => ({
            ...section,
            items: section.items.filter(item => {
                // Dispositivos only appears if user has the 'dispositivos' module
                if (item.slug === 'dispositivos') {
                    // Explicit boolean return
                    return !!(user?.modulos?.some(m => m.slug === 'dispositivos'));
                }
                return true;
            })
        })).filter(section => section.items.length > 0);
    }, [user]);

    return (
        <>
            {/* Mobile Toggle Button - Visible only when sidebar is closed on mobile */}
            {!isMobileOpen && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileOpen(true);
                    }}
                    className="fixed left-5 top-5 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl transition-all active:scale-95 z-[100] lg:hidden flex items-center justify-center border border-slate-700/50"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Mobile Backdrop - Visible only when sidebar is OPEN on mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 bottom-0 h-[100dvh] bg-white/80 backdrop-blur-xl border-r border-white/40 transition-all duration-300 z-50 flex flex-col shadow-2xl shadow-indigo-100/20 lg:shadow-none",
                isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
                !isMobileOpen && (isCollapsed ? "lg:w-20" : "lg:w-64")
            )}>
                {/* Header/Logo */}
                <div className="h-16 flex items-center px-4 border-b border-white/40">
                    <Link href="/" className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity">
                        <div className="flex-shrink-0">
                            <Image
                                src="/icons/omnigrow_clean.png"
                                alt="OmniGrow Logo"
                                width={32}
                                height={32}
                                className="rounded-lg object-contain"
                            />
                        </div>
                        {(!isCollapsed || isMobileOpen) && (
                            <span className="font-black text-lg text-slate-900 whitespace-nowrap tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
                                OmniGrow
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-hide">
                    {filteredMenuItems.map((section) => (
                        <div key={section.title} className="space-y-1">
                            {(!isCollapsed || isMobileOpen) && (
                                <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
                                    {section.title}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            prefetch={false}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) setIsMobileOpen(false)
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                                isActive
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                    : "text-slate-500 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm"
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                                isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"
                                            )} />
                                            {(!isCollapsed || isMobileOpen) && (
                                                <span className="font-black text-[13px] whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                                            )}
                                            {isActive && (!isCollapsed || isMobileOpen) && (
                                                <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer/Logout */}
                <div className="p-3 border-t border-slate-100 space-y-2">
                    {(!isCollapsed || isMobileOpen) && (
                        <div className="px-3">
                            <SessionTimer />
                        </div>
                    )}

                    <div className="space-y-1">
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all group active:scale-95"
                        >
                            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 transition-colors" />
                            {(!isCollapsed || isMobileOpen) && <span className="font-black text-[11px] uppercase tracking-widest">Cerrar Sesión</span>}
                        </button>

                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsMobileOpen(false)
                                } else if (setIsCollapsed) {
                                    setIsCollapsed(!isCollapsed)
                                }
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            {(isMobileOpen || !isCollapsed) ? <X className="w-5 h-5 opacity-50" /> : <Menu className="w-5 h-5 mx-auto" />}
                            {(!isCollapsed || isMobileOpen) && <span className="font-black text-[11px] uppercase tracking-widest">Contraer Menú</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
