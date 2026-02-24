'use client'

import { Sala } from '@/lib/types/api'
import { Home, Layers, ChevronRight, Settings, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { useRouter } from 'next/navigation'

interface RoomCardProps {
    sala: Sala
    onDelete?: (id: number, e: React.MouseEvent) => void
}

export function RoomCard({ sala, onDelete }: RoomCardProps) {
    const router = useRouter()
    const camaCount = sala.camas?.length || 0

    const handleCardClick = () => {
        router.push(`/salas/${sala.id}`)
    }

    return (
        <div
            onClick={handleCardClick}
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden cursor-pointer p-6 relative"
        >
            {/* Pro Max Decorative Blob */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Home className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(sala.id, e)
                            }}
                            className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all relative z-10"
                            title="Eliminar Sala"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/salas/${sala.id}`)
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors relative z-10"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors tracking-tight">
                {sala.nombre}
            </h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium">
                {sala.descripcion || 'Sin descripción'}
            </p>

            <div className="flex items-center gap-4 py-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-80">
                        {camaCount} {camaCount === 1 ? 'Superficie' : 'Superficies'}
                    </span>
                </div>
            </div>

            <div
                className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group/btn shadow-sm group-hover:shadow-indigo-600/20"
            >
                VER DETALLE
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </div>
        </div>
    )
}
