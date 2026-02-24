'use client'

import { Cultivo, CropStatus } from '@/lib/types/api'
import { Sprout, Calendar, MapPin, ChevronRight, Activity, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CropCardProps {
    cultivo: Cultivo
    onEdit?: (cultivo: Cultivo, e: React.MouseEvent) => void
    onDelete?: (id: number, e: React.MouseEvent) => void
}

const statusConfig: Record<string, { color: string, bg: string, label: string }> = {
    'activo': { color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'ACTIVO' },
    'esqueje': { color: 'text-teal-600', bg: 'bg-teal-50', label: 'ESQUEJE' },
    'vegetativo': { color: 'text-blue-600', bg: 'bg-blue-50', label: 'VEGETATIVO' },
    'floracion': { color: 'text-purple-600', bg: 'bg-purple-50', label: 'FLORACIÓN' },
    'cosecha': { color: 'text-orange-600', bg: 'bg-orange-50', label: 'COSECHA' },
    'finalizado': { color: 'text-slate-600', bg: 'bg-slate-50', label: 'FINALIZADO' },
    'cancelado': { color: 'text-red-600', bg: 'bg-red-50', label: 'CANCELADO' },
}

export function CropCard({ cultivo, onEdit, onDelete }: CropCardProps) {
    const status = statusConfig[cultivo.estado.toLowerCase()] || statusConfig['activo']
    const plantCount = cultivo.plantas?.length || 0

    return (
        <Link
            href={`/cultivos/${cultivo.id}`}
            className="@container group block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden p-4 md:p-6 relative"
        >
            {/* Pro Max Decorative Blob */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Sprout className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={(e) => onEdit(cultivo, e)}
                            className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Editar Cultivo"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => onDelete(cultivo.id, e)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Eliminar Cultivo"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <div className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 rounded-[0.75rem] md:rounded-[1rem] text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border border-slate-50",
                        status.bg,
                        status.color
                    )}>
                        <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse", status.color.replace('text', 'bg'))} />
                        {status.label}
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors tracking-tight">
                {cultivo.nombre}
            </h3>

            <div className="flex items-center gap-2 text-slate-400 mb-6">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest opacity-80">{cultivo.sala?.nombre || 'Sin sala asignada'}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex flex-col gap-1.5 hover:bg-white transition-all hover:shadow-sm">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-70">
                        {cultivo.variedades && cultivo.variedades.length > 1 ? 'Genéticas' : 'Genética'}
                    </span>
                    <span
                        className="text-[13px] font-black text-slate-900 truncate tracking-tight"
                        title={
                            cultivo.variedades && cultivo.variedades.length > 0
                                ? cultivo.variedades.map(v => v.nombre).join(', ')
                                : cultivo.variedad?.nombre || 'N/A'
                        }
                    >
                        {cultivo.variedades && cultivo.variedades.length > 1 ? (
                            `${cultivo.variedades.length} Variedades`
                        ) : cultivo.variedades && cultivo.variedades.length === 1 ? (
                            cultivo.variedades[0].nombre
                        ) : cultivo.variedad ? (
                            cultivo.variedad.nombre
                        ) : (
                            'N/A'
                        )}
                    </span>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex flex-col gap-1.5 hover:bg-white transition-all hover:shadow-sm">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-70">Inventario</span>
                    <span className="text-[13px] font-black text-slate-900 tracking-tight">{plantCount} Plantas</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest opacity-60">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{new Date(cultivo.fecha_inicio).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group/btn shadow-sm group-hover:shadow-indigo-600/20 active:scale-[0.98]">
                VER DETALLE
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </div>
        </Link>
    )
}
