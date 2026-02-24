'use client'

import { HistorialFase } from '@/lib/types/api'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { CheckCircle2, Circle, Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhaseTimelineProps {
    historial: HistorialFase[]
}

export function PhaseTimeline({ historial }: PhaseTimelineProps) {
    if (!historial || historial.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No hay historial de etapas registrado.</p>
            </div>
        )
    }

    // Sort historial by date descending
    const sortedHistorial = [...historial].sort((a, b) =>
        new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
    )

    return (
        <div className="space-y-4 @[600px]:space-y-8 relative before:absolute before:inset-0 before:ml-4 @[600px]:before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {sortedHistorial.map((entry, index) => {
                const isFirst = index === 0

                return (
                    <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon - Compact */}
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 @[600px]:w-10 @[600px]:h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-300",
                            isFirst ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            {isFirst ? <CheckCircle2 className="w-4 h-4 @[600px]:w-5 @[600px]:h-5" /> : <Circle className="w-2.5 h-2.5 fill-current" />}
                        </div>
                        {/* Content - Dense & Readable */}
                        <div className="w-[calc(100%-3rem)] @[600px]:w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3.5 @[600px]:p-4 rounded-xl @[600px]:rounded-2xl border border-slate-100 bg-white shadow-sm transition-all group-hover:border-sky-100">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="font-black text-sm @[600px]:text-base text-slate-900 truncate uppercase tracking-tight">{entry.fase.nombre}</div>
                                <time className="font-black text-[10px] @[600px]:text-xs text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-lg shrink-0">
                                    {formatLocalDate(entry.fecha_inicio)}
                                </time>
                            </div>
                            <div className="text-slate-500 text-xs @[600px]:text-sm">
                                {entry.fecha_fin ? (
                                    <span className="opacity-70">Terminó el {formatLocalDate(entry.fecha_fin)}</span>
                                ) : (
                                    <span className="text-emerald-500 font-black flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                        ACTIVA
                                    </span>
                                )}
                            </div>
                            {entry.notas && (
                                <div className="mt-2.5 flex items-start gap-2 p-2 bg-slate-50/80 rounded-lg text-xs text-slate-500 leading-relaxed">
                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                                    <span className="">{entry.notas}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
