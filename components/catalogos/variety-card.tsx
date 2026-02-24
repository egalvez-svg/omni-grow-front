'use client'

import { Variedad } from '@/lib/types/api'
import { Dna, Bookmark, Tag, Edit2, Trash2 } from 'lucide-react'

interface VarietyCardProps {
    variedad: Variedad
    onEdit: (v: Variedad) => void
    onDelete: (v: Variedad) => void
}

export function VarietyCard({ variedad: v, onEdit, onDelete }: VarietyCardProps) {
    return (
        <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden p-6 relative">
            {/* Pro Max Decorative Blob */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Dna className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={() => onEdit(v)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                            title="Editar"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(v)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight tracking-tight group-hover:text-indigo-700 transition-colors">
                    {v.nombre}
                </h3>

                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black uppercase tracking-widest mb-4 opacity-70">
                    <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate">{v.banco || 'Banco General'}</span>
                </div>

                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                    {v.descripcion || 'Sin descripción genética detallada.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                        <Tag className="w-3 h-3" />
                        {v.tipo || 'Híbrida'}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                        GENÉTICA PRO
                    </div>
                </div>
            </div>
        </div>
    )
}
