'use client'

import { TrendingUp, Sprout, Droplets, Dna, MapPin, Activity, Layers, ClipboardList, FileText } from 'lucide-react'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { PhaseTimeline } from '@/components/cultivos/phase-timeline'
import { cn } from '@/lib/utils'
import { Cultivo, NutricionSemanal } from '@/lib/types/api'

interface OverviewTabProps {
    cultivo: Cultivo
    ultimoRiego: NutricionSemanal | null
}

export function OverviewTab({ cultivo, ultimoRiego }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-1">Días de Ciclo</span>
                        <p className="text-3xl font-black text-slate-900">{cultivo.dias_ciclo}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                            <Sprout className="w-6 h-6" />
                        </div>
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-1">Población</span>
                        <p className="text-3xl font-black text-slate-900">
                            {cultivo.plantas?.length || 0} / {cultivo.cantidad_plantas || 0}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                            <Droplets className="w-6 h-6" />
                        </div>
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-1">Último Riego</span>
                        <p className="text-xl font-black text-slate-900">
                            {ultimoRiego
                                ? formatLocalDate(ultimoRiego.fecha_aplicacion, { day: '2-digit', month: '2-digit', year: '2-digit' })
                                : 'Sin registros'}
                        </p>
                    </div>
                </div>

                {/* Historial de Fases (Timeline) */}
                <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-800">Línea de Tiempo del Ciclo</h2>
                    </div>
                    <div className="p-8">
                        <PhaseTimeline historial={cultivo.historialFases || []} />
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                {/* Variety Detail */}
                <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Dna className="w-32 h-32" />
                    </div>
                    <h3 className="text-xl font-bold mb-6">Ficha Genética</h3>
                    <div className="space-y-6 relative z-10">
                        <div>
                            <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                                {cultivo.variedades && cultivo.variedades.length > 1 ? 'Variedades' : 'Variedad'}
                            </span>
                            <div className="mt-2 space-y-2">
                                {cultivo.variedades && cultivo.variedades.length > 0 ? (
                                    cultivo.variedades.map((variedad, index) => (
                                        <div key={variedad.id || index} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                            <p className="text-lg font-bold text-sky-400">{variedad.nombre}</p>
                                            {variedad.banco && (
                                                <p className="text-sm text-slate-400 mt-1">Banco: {variedad.banco}</p>
                                            )}
                                            {variedad.tipo && (
                                                <p className="text-xs text-slate-500 mt-1">Tipo: {variedad.tipo}</p>
                                            )}
                                        </div>
                                    ))
                                ) : cultivo.variedad ? (
                                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                        <p className="text-lg font-bold text-sky-400">{cultivo.variedad.nombre}</p>
                                        {cultivo.variedad.banco && (
                                            <p className="text-sm text-slate-400 mt-1">Banco: {cultivo.variedad.banco}</p>
                                        )}
                                        {cultivo.variedad.tipo && (
                                            <p className="text-xs text-slate-500 mt-1">Tipo: {cultivo.variedad.tipo}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-sky-400">Seleccionada</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location Detail */}
                <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-sky-500" />
                        Ubicación
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-0.5">Sala</span>
                                <p className="text-base font-bold text-slate-800 leading-tight">{cultivo.sala?.nombre || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-0.5">Cama</span>
                                <p className="text-base font-bold text-slate-800 leading-tight">
                                    {cultivo.cama?.nombre || 'N/A'}
                                    {cultivo.cama && (
                                        <span className="text-[10px] text-slate-400 ml-2 font-medium">
                                            ({cultivo.cama.filas}x{cultivo.cama.columnas})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sky-500 shadow-sm border border-slate-100">
                                <Droplets className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-0.5">Medio de Cultivo</span>
                                <p className="text-base font-bold text-slate-800 leading-tight">
                                    {cultivo.medioCultivo?.nombre || 'N/D'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
