'use client'

import { FlaskConical, Plus, Beaker, TrendingUp, Droplets, Edit2, Trash2, Calendar, FileText } from 'lucide-react'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import { NutricionSemanal } from '@/lib/types/api'

interface NutricionTabProps {
    historialNutricion: NutricionSemanal[]
    onAddNutricion: () => void
    onEditNutricion: (log: NutricionSemanal) => void
    onDeleteNutricion: (logId: number) => void
    dataLoading: boolean
}

export function NutricionTab({ historialNutricion, onAddNutricion, onEditNutricion, onDeleteNutricion, dataLoading }: NutricionTabProps) {
    return (
        <div className="space-y-8">
            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm">
                            <FlaskConical className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 leading-tight">Historial Nutricional</h2>
                            <p className="text-sm text-slate-400 font-medium">Registros de riego y planes aplicados</p>
                        </div>
                    </div>
                    <button
                        onClick={onAddNutricion}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                    >
                        <Plus className="w-5 h-5 text-sky-400" />
                        Nuevo Registro
                    </button>
                </div>

                {dataLoading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner text="Cargando historial..." />
                    </div>
                ) : historialNutricion && historialNutricion.length > 0 ? (
                    <div className="space-y-6">
                        {historialNutricion.map((log) => (
                            <div key={log.id} className="relative group">
                                {/* Línea de tiempo vertical */}
                                <div className="absolute left-[24px] top-[60px] bottom-[-24px] w-0.5 bg-slate-100 group-last:hidden" />

                                <div className="flex gap-6">
                                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-sky-200 group-hover:text-sky-500 transition-all shadow-sm">
                                        {log.tipo_riego === 'nutricion' ? <Beaker className="w-5 h-5" /> :
                                            log.tipo_riego === 'agua_esquejes' ? <TrendingUp className="w-5 h-5 text-teal-500" /> :
                                                <Droplets className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 bg-slate-50/50 rounded-[2rem] border border-slate-100 p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group/card">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        log.tipo_riego === 'nutricion' ? "bg-emerald-100 text-emerald-700" :
                                                            log.tipo_riego === 'agua_esquejes' ? "bg-teal-100 text-teal-700" :
                                                                log.tipo_riego === 'solo_agua' ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"
                                                    )}>
                                                        {log.tipo_riego?.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                        • Semana {log.semana || '?'}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {formatLocalDate(log.fecha_aplicacion, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onEditNutricion(log)}
                                                    className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover/card:opacity-100"
                                                    title="Editar Registro"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteNutricion(log.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover/card:opacity-100"
                                                    title="Eliminar Registro"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>

                                                <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                                    <div className="text-center px-4 border-r border-slate-100">
                                                        <span className="block text-[8px] font-black text-slate-400 uppercase">Litros</span>
                                                        <span className="text-sm font-black text-slate-700">{log.litros_agua}L</span>
                                                    </div>
                                                    <div className="text-center px-4 border-r border-slate-100">
                                                        <span className="block text-[8px] font-black text-slate-400 uppercase text-rose-400">pH</span>
                                                        <span className="text-sm font-black text-slate-700">{log.ph || 'N/A'}</span>
                                                    </div>
                                                    <div className="text-center px-4">
                                                        <span className="block text-[8px] font-black text-slate-400 uppercase text-amber-500">EC</span>
                                                        <span className="text-sm font-black text-slate-700">{log.ec || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Productos aplicados */}
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <div className="flex flex-wrap gap-2">
                                                {log.productos && log.productos.length > 0 ? (
                                                    log.productos.map((prod) => (
                                                        <div key={prod.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl border border-sky-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-tight">
                                                                {prod.productoNutricion?.nombre}: {prod.dosis_por_litro} ml/L
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-dashed border-slate-200">
                                                        Sin productos adicionales
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {log.notas && (
                                            <div className="flex gap-3 p-4 bg-white/50 border border-slate-100 rounded-2xl italic text-slate-500 text-sm">
                                                <FileText className="w-4 h-4 text-slate-300 shrink-0" />
                                                {log.notas}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                            <FlaskConical className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Historial Vacío</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
                            Aún no has registrado ningún evento nutricional para este cultivo. Agrega tu primer riego para empezar el seguimiento.
                        </p>
                        <button
                            onClick={onAddNutricion}
                            className="mt-8 px-8 py-3 bg-sky-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 active:scale-95"
                        >
                            Registrar Primer Riego
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}
