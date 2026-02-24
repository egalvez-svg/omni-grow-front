'use client'

import { TimelineEvent, TimelineNutricionData, TimelineControlPlagaData, TimelineCambioFaseData } from '@/lib/types/api'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { cn } from '@/lib/utils'
import {
    FlaskConical,
    ShieldCheck,
    Milestone,
    Droplet,
    Bug,
    ArrowRight,
    Calendar,
    StickyNote
} from 'lucide-react'

interface UnifiedTimelineProps {
    events: TimelineEvent[]
    isLoading?: boolean
}

export function UnifiedTimeline({ events, isLoading }: UnifiedTimelineProps) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-slate-100 rounded w-1/4" />
                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Aún no hay eventos registrados en este ciclo.</p>
            </div>
        )
    }

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
            {events.map((event, index) => (
                <TimelineItem key={event.id || index} event={event} />
            ))}
        </div>
    )
}

function TimelineItem({ event }: { event: TimelineEvent }) {
    const isNutricion = event.tipo === 'nutricion'
    const isPlaga = event.tipo === 'control_plagas'
    const isFase = event.tipo === 'cambio_fase'

    const Icon = isNutricion ? FlaskConical : isPlaga ? ShieldCheck : Milestone
    const bgColor = isNutricion ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
        : isPlaga ? 'bg-rose-50 border-rose-100 text-rose-600'
            : 'bg-amber-50 border-amber-100 text-amber-600'

    return (
        <div className="relative flex items-start gap-6 group">
            {/* Icon & Connector dot */}
            <div className={cn(
                "relative z-10 w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 bg-white group-hover:scale-110",
                bgColor
            )}>
                <Icon className="w-6 h-6" />
                {/* Connecting dot on the line */}
                <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-white border-2 border-slate-300 shadow-sm" />
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 group-hover:shadow-md transition-all duration-300">
                <div className="flex flex-col @[600px]:flex-row @[600px]:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                            isNutricion && "bg-indigo-100 text-indigo-700",
                            isPlaga && "bg-rose-100 text-rose-700",
                            isFase && "bg-amber-100 text-amber-700"
                        )}>
                            {isNutricion ? 'Nutrición' : isPlaga ? 'Control de Plagas' : 'Cambio de Fase'}
                        </span>
                        <span className="text-slate-400 text-xs font-bold font-mono">
                            {formatLocalDate(event.fecha)}
                        </span>
                    </div>
                </div>

                {/* Event Specific Data */}
                <div className="space-y-4">
                    {isNutricion && <NutricionDetails data={event.datos as TimelineNutricionData} />}
                    {isPlaga && <PlagaDetails data={event.datos as TimelineControlPlagaData} />}
                    {isFase && <FaseDetails data={event.datos as TimelineCambioFaseData} />}

                    {event.notas && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-start gap-3 border border-slate-100/50">
                            <StickyNote className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-600 font-medium italic">"{event.notas}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function NutricionDetails({ data }: { data: TimelineNutricionData }) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 rounded-xl border border-sky-100">
                    <Droplet className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-black text-sky-700">{data.litros_agua}L</span>
                </div>
                {data.ph && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-xs font-black text-emerald-700">pH {data.ph}</span>
                    </div>
                )}
                {data.ec && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                        <span className="text-xs font-black text-indigo-700">EC {data.ec}</span>
                    </div>
                )}
            </div>

            {data.productos && data.productos.length > 0 && (
                <div className="grid grid-cols-1 @[500px]:grid-cols-2 gap-2">
                    {data.productos.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">{p.nombre}</span>
                            <span className="text-xs font-black text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                {p.cantidad}{p.unidad}/L
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function PlagaDetails({ data }: { data: TimelineControlPlagaData }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl border border-rose-100 w-fit">
                <Bug className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-black text-rose-700 uppercase tracking-wider">{data.metodo}</span>
            </div>

            {data.productos && data.productos.length > 0 && (
                <div className="grid grid-cols-1 @[500px]:grid-cols-2 gap-2">
                    {data.productos.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{p.nombre}</span>
                                {p.tipo && <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{p.tipo}</span>}
                            </div>
                            <span className="text-xs font-black text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                {p.cantidad}{p.unidad}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function FaseDetails({ data }: { data: any }) {
    // Intentar extraer el nombre de la fase de varias fuentes posibles según el backend
    const faseNueva = data.fase_nueva || data.nueva_fase || data.fase || data.nombre;
    const faseAnterior = data.fase_anterior || data.fase_previa || data.anterior;

    if (!faseNueva) return null;

    return (
        <div className="flex items-center gap-3 py-1">
            {faseAnterior && (
                <>
                    <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                        {faseAnterior}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                </>
            )}
            <div className="px-4 py-1.5 bg-amber-500 text-white rounded-xl border border-amber-600 shadow-md shadow-amber-500/10 text-[11px] font-black uppercase tracking-widest ring-2 ring-amber-50">
                {faseNueva}
            </div>
        </div>
    )
}
