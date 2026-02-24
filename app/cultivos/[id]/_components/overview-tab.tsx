'use client'

import { TrendingUp, Sprout, Droplets, Dna, MapPin, Activity, Layers, ClipboardList, FileText, Calendar, ShieldCheck } from 'lucide-react'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { PhaseTimeline } from '@/components/cultivos/phase-timeline'
import { UnifiedTimeline } from '@/components/cultivos/unified-timeline'
import { cn } from '@/lib/utils'
import { Cultivo, NutricionSemanal, TimelineEvent, ControlPlaga } from '@/lib/types/api'

interface OverviewTabProps {
    cultivo: Cultivo
    ultimoRiego: NutricionSemanal | null
    ultimoControlPlaga: ControlPlaga | null
    timeline: TimelineEvent[]
    isLoadingTimeline?: boolean
}

export function OverviewTab({ cultivo, ultimoRiego, ultimoControlPlaga, timeline, isLoadingTimeline }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-8">
                {/* Stats Grid - Bento Style (UI/UX Pro Max) */}
                <div className="grid grid-cols-2 lg:grid-cols-3 @[800px]:grid-cols-5 gap-3 @[800px]:gap-4">
                    <div className="bg-white p-2.5 @[800px]:p-6 rounded-xl @[800px]:rounded-3xl border border-slate-200 shadow-sm flex items-center @[800px]:flex-col @[800px]:items-start gap-2.5 @[800px]:gap-0">
                        <div className="w-9 h-9 @[800px]:w-12 @[800px]:h-12 rounded-lg @[800px]:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center @[800px]:mb-3 shrink-0">
                            <TrendingUp className="w-4.5 h-4.5 @[800px]:w-6 @[800px]:h-6" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-slate-400 text-[10px] @[800px]:text-sm font-black block mb-0 @[800px]:mb-1 truncate">Días Ciclo</span>
                            <p className="text-xl @[800px]:text-3xl font-black text-slate-900 leading-none">{cultivo.dias_ciclo}</p>
                        </div>
                    </div>

                    <div className="bg-white p-2.5 @[800px]:p-6 rounded-xl @[800px]:rounded-3xl border border-slate-200 shadow-sm flex items-center @[800px]:flex-col @[800px]:items-start gap-2.5 @[800px]:gap-0">
                        <div className="w-9 h-9 @[800px]:w-12 @[800px]:h-12 rounded-lg @[800px]:rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center @[800px]:mb-3 shrink-0">
                            <Calendar className="w-4.5 h-4.5 @[800px]:w-6 @[800px]:h-6" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-slate-400 text-[10px] @[800px]:text-sm font-black block mb-0 @[800px]:mb-1 truncate">Inicio</span>
                            <p className="text-sm @[800px]:text-xl font-black text-slate-900 leading-none">
                                {formatLocalDate(cultivo.fecha_inicio, { day: '2-digit', month: '2-digit', year: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-2.5 @[800px]:p-6 rounded-xl @[800px]:rounded-3xl border border-slate-200 shadow-sm flex items-center @[800px]:flex-col @[800px]:items-start gap-2.5 @[800px]:gap-0">
                        <div className="w-9 h-9 @[800px]:w-12 @[800px]:h-12 rounded-lg @[800px]:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center @[800px]:mb-3 shrink-0">
                            <Sprout className="w-4.5 h-4.5 @[800px]:w-6 @[800px]:h-6" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-slate-400 text-[10px] @[800px]:text-sm font-black block mb-0 @[800px]:mb-1 truncate">Plantas</span>
                            <p className="text-xl @[800px]:text-3xl font-black text-slate-900 leading-none truncate">
                                {cultivo.plantas?.length || 0} / {cultivo.cantidad_plantas || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-2.5 @[800px]:p-6 rounded-xl @[800px]:rounded-3xl border border-slate-200 shadow-sm flex items-center @[800px]:flex-col @[800px]:items-start gap-2.5 @[800px]:gap-0">
                        <div className="w-9 h-9 @[800px]:w-12 @[800px]:h-12 rounded-lg @[800px]:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center @[800px]:mb-3 shrink-0">
                            <Droplets className="w-4.5 h-4.5 @[800px]:w-6 @[800px]:h-6" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-slate-400 text-[10px] @[800px]:text-sm font-black block mb-0 @[800px]:mb-1 truncate">Último Riego</span>
                            <p className="text-sm @[800px]:text-xl font-black text-slate-900 leading-none">
                                {ultimoRiego
                                    ? formatLocalDate(ultimoRiego.fecha_aplicacion, { day: '2-digit', month: '2-digit', year: '2-digit' })
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="col-span-2 @[800px]:col-span-1 bg-white p-2.5 @[800px]:p-6 rounded-xl @[800px]:rounded-3xl border border-slate-200 shadow-sm flex items-center @[800px]:flex-col @[800px]:items-start gap-2.5 @[800px]:gap-0">
                        <div className="w-9 h-9 @[800px]:w-12 @[800px]:h-12 rounded-lg @[800px]:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center @[800px]:mb-3 shrink-0">
                            <ShieldCheck className="w-4.5 h-4.5 @[800px]:w-6 @[800px]:h-6" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-slate-400 text-[10px] @[800px]:text-sm font-black block mb-0 @[800px]:mb-1 truncate">Protección</span>
                            <p className="text-sm @[800px]:text-xl font-black text-slate-900 leading-none">
                                {ultimoControlPlaga
                                    ? formatLocalDate(ultimoControlPlaga.fecha_aplicacion, { day: '2-digit', month: '2-digit', year: '2-digit' })
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Historial de Fases (Timeline) - Ultra Compacto */}
                <section className="bg-white rounded-2xl @[800px]:rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 @[600px]:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="text-sm @[600px]:text-xl font-black">Línea de Tiempo del Ciclo</h2>
                    </div>
                    <div className="p-3 @[600px]:p-8">
                        <UnifiedTimeline events={timeline} isLoading={isLoadingTimeline} />
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                {/* Variety & Location - Compact Bento Side (UI/UX Pro Max) */}
                <div className="grid grid-cols-1 @[500px]:grid-cols-2 lg:grid-cols-1 gap-4">
                    {/* Variety Detail */}
                    <section className="bg-slate-900 text-white rounded-3xl p-5 @[800px]:p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Dna className="w-16 h-16" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black tracking-widest text-sky-400">Genética</h3>
                            {cultivo.variedades && cultivo.variedades.length > 1 && (
                                <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-sky-500/30">
                                    {cultivo.variedades.length} Variedades
                                </span>
                            )}
                        </div>
                        <div className="space-y-3 relative z-10 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
                            {cultivo.variedades && cultivo.variedades.length > 0 ? (
                                cultivo.variedades.map((variedad, index) => (
                                    <div key={variedad.id || index} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                        <p className="text-base font-black text-white leading-tight">{variedad.nombre}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5 tracking-wider">{variedad.banco || 'Banco General'}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                    <p className="text-base font-black text-white leading-tight">{cultivo.variedad?.nombre || 'General'}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 tracking-wider">Por Defecto</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Location Detail */}
                    <section className="bg-white rounded-3xl border border-slate-200 p-5 @[800px]:p-8 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 tracking-widest mb-4">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            Ubicación
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100/50">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 shrink-0">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 leading-none block">Sala</span>
                                    <p className="text-xs font-black text-slate-800 leading-tight truncate">{cultivo.sala?.nombre || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100/50">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 shrink-0">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black text-slate-400 leading-none block">Cama</span>
                                    <p className="text-xs font-black text-slate-800 leading-tight truncate">
                                        {cultivo.cama?.nombre || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
