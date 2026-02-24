'use client'

import { Producto } from '@/lib/types/api'
import { ShoppingBag, Edit2, Trash2, CheckCircle2, XCircle, Beaker, FlaskConical, ShieldCheck, Bug, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardProps {
    producto: Producto
    onEdit: (p: Producto) => void
    onDelete: (p: Producto) => void
}

export function ProductCard({ producto: p, onEdit, onDelete }: ProductCardProps) {
    const lowerNombre = p.tipo?.nombre.toLowerCase() || ''
    const isNutricion = lowerNombre.includes('nutri') || lowerNombre.includes('abono') || lowerNombre.includes('fertil')
    const isPreventivo = lowerNombre.includes('preven') || lowerNombre.includes('hongo') || lowerNombre.includes('fungi') || lowerNombre.includes('protec') || lowerNombre.includes('estimu')
    const isCorrectivo = lowerNombre.includes('plaga') || lowerNombre.includes('insect') || lowerNombre.includes('correc') || lowerNombre.includes('acari') || lowerNombre.includes('bicho')
    const isRiego = lowerNombre.includes('riego') || lowerNombre.includes('agua') || lowerNombre.includes('hidro')

    const Icon = isNutricion ? FlaskConical
        : isPreventivo ? ShieldCheck
            : isCorrectivo ? Bug
                : isRiego ? Droplets
                    : ShoppingBag

    return (
        <div className={cn(
            "group bg-white rounded-3xl border shadow-sm transition-all duration-300 overflow-hidden p-6 relative flex flex-col h-full",
            isNutricion && "border-indigo-100/50 hover:border-indigo-300 hover:shadow-indigo-500/5",
            isPreventivo && "border-amber-100/50 hover:border-amber-300 hover:shadow-amber-500/5",
            isCorrectivo && "border-rose-100/50 hover:border-rose-300 hover:shadow-rose-500/5",
            isRiego && "border-cyan-100/50 hover:border-cyan-300 hover:shadow-cyan-500/5",
            !(isNutricion || isPreventivo || isCorrectivo || isRiego) && "border-slate-100 hover:border-emerald-100 hover:shadow-emerald-500/5"
        )}>
            {/* Pro Max Decorative Blob - Type Themed */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700 opacity-40 group-hover:opacity-60",
                isNutricion && "bg-gradient-to-br from-indigo-500/20 to-blue-500/10",
                isPreventivo && "bg-gradient-to-br from-amber-500/20 to-orange-500/10",
                isCorrectivo && "bg-gradient-to-br from-rose-500/20 to-pink-500/10",
                isRiego && "bg-gradient-to-br from-cyan-500/20 to-emerald-500/10",
                !(isNutricion || isPreventivo || isCorrectivo || isRiego) && "bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
            )} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                        p.activo
                            ? cn(
                                isNutricion && "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
                                isPreventivo && "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
                                isCorrectivo && "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
                                isRiego && "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
                                !(isNutricion || isPreventivo || isCorrectivo || isRiego) && "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                            )
                            : "bg-slate-50 text-slate-400 group-hover:bg-slate-400 group-hover:text-white"
                    )}>
                        <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex items-center gap-1.5 translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={() => onEdit(p)}
                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                            title="Editar"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(p)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className={cn(
                        "text-xl font-black text-slate-900 mb-1 leading-tight tracking-tight transition-colors",
                        isNutricion && "group-hover:text-indigo-700",
                        isPreventivo && "group-hover:text-amber-700",
                        isCorrectivo && "group-hover:text-rose-700",
                        isRiego && "group-hover:text-cyan-700",
                        !(isNutricion || isPreventivo || isCorrectivo || isRiego) && "group-hover:text-emerald-700"
                    )}>
                        {p.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-black uppercase tracking-widest opacity-80">
                        <Beaker className={cn(
                            "w-3.5 h-3.5",
                            isNutricion && "text-indigo-500",
                            isPreventivo && "text-amber-500",
                            isCorrectivo && "text-rose-500",
                            isRiego && "text-cyan-500",
                            !(isNutricion || isPreventivo || isCorrectivo || isRiego) && "text-emerald-500"
                        )} />
                        <span className="truncate">{p.fabricante || 'Fabricante Genérico'}</span>
                    </div>
                </div>

                <p className="text-slate-500 text-sm mb-8 flex-1 leading-relaxed font-medium">
                    {p.descripcion || 'Sin descripción de aplicación detallada para este producto.'}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Badge de Categoría */}
                        {p.tipo && (
                            <span className={cn(
                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                isNutricion && "bg-indigo-100 text-indigo-700 border-indigo-200",
                                isPreventivo && "bg-amber-100 text-amber-700 border-amber-200",
                                isCorrectivo && "bg-rose-100 text-rose-700 border-rose-200",
                                isRiego && "bg-cyan-100 text-cyan-700 border-cyan-200",
                                !(isNutricion || isPreventivo || isCorrectivo || isRiego) && "bg-slate-50 text-slate-600 border-slate-100"
                            )}>
                                {p.tipo.nombre}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
