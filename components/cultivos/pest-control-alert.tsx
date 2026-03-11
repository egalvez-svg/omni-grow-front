'use client'

import { TareaControlPlaga } from '@/lib/types/api'
import { ShieldAlert, Calendar, Check, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { omitirTareaControlPlaga } from '@/lib/api/cultivos-service'
import { useToast } from '@/providers/toast-provider'

interface PestControlAlertProps {
    tareas: TareaControlPlaga[]
    onAddApplication: (tarea: TareaControlPlaga) => void
    cultivoId: number
}

export function PestControlAlert({ tareas, onAddApplication, cultivoId }: PestControlAlertProps) {

    const [isOmitting, setIsOmitting] = useState<number | null>(null)
    const [motivo, setMotivo] = useState('')
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const omitMutation = useMutation({
        mutationFn: ({ id, motivo }: { id: number, motivo: string }) => omitirTareaControlPlaga(id, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tareas-pendientes', cultivoId] })
            queryClient.invalidateQueries({ queryKey: ['resumen-plagas', cultivoId] })
            showToast('Tarea omitida correctamente', 'success')
            setIsOmitting(null)
            setMotivo('')
        },
        onError: () => showToast('Error al omitir la tarea', 'error')
    })

    if (tareas.length === 0) return null

    // Mostrar la más antigua primero o la de hoy
    const tareaActiva = tareas[0]
    const esVencida = new Date(tareaActiva.fecha_programada) < new Date(new Date().setHours(0, 0, 0, 0))
    const esHoy = new Date(tareaActiva.fecha_programada).toDateString() === new Date().toDateString()

    // Datos del tratamiento con manejo seguro de campos faltantes
    const nombre = tareaActiva.controlPlaga?.nombre
        || `Control ${tareaActiva.tipo_aplicacion === 'preventivo' ? 'Preventivo' : 'Combativo'}`
    const progreso = tareaActiva.repeticion_actual && tareaActiva.repeticiones_totales
        ? ` (${tareaActiva.repeticion_actual} de ${tareaActiva.repeticiones_totales})`
        : ''
    const progressPercent = tareaActiva.repeticion_actual && tareaActiva.repeticiones_totales
        ? (tareaActiva.repeticion_actual / tareaActiva.repeticiones_totales) * 100
        : 0

    return (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={cn(
                "relative overflow-hidden rounded-[2rem] border p-1 transition-all shadow-xl",
                esVencida
                    ? "bg-rose-50 border-rose-200 shadow-rose-900/5"
                    : "bg-amber-50 border-amber-200 shadow-amber-900/5"
            )}>
                {/* Decorative Background Icon */}
                <ShieldAlert className={cn(
                    "absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] transition-transform duration-700",
                    esVencida ? "text-rose-900" : "text-amber-900"
                )} />

                <div className="relative z-10 p-5 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    {/* Icon Badge */}
                    <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner shrink-0",
                        esVencida ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                    )}>
                        <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                esVencida ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            )}>
                                {esVencida ? 'Aplicación Atrasada' : 'Toca Aplicación'}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatLocalDate(tareaActiva.fecha_programada, { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>

                        <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight mb-2">
                            {nombre}{progreso}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium max-w-xl">
                            {tareaActiva.controlPlaga
                                ? `Método: ${tareaActiva.controlPlaga.metodo_aplicacion} · cada ${tareaActiva.controlPlaga.intervalo_dias} días`
                                : 'Es momento de proteger tu cultivo para asegurar una cosecha saludable.'}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-center gap-3 shrink-0">
                        {isOmitting === tareaActiva.id ? (
                            <div className="flex flex-col items-end gap-2 bg-white/50 p-2 rounded-2xl border border-slate-200">
                                <input
                                    autoFocus
                                    placeholder="Motivo de omisión..."
                                    className="w-full md:w-64 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsOmitting(null)}
                                        className="p-2 text-slate-400 hover:text-slate-600 transition-all font-black text-[10px] uppercase"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={!motivo || omitMutation.isPending}
                                        onClick={() => omitMutation.mutate({ id: tareaActiva.id, motivo })}
                                        className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all disabled:opacity-50"
                                    >
                                        {omitMutation.isPending ? 'Procesando...' : 'Confirmar Omisión'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => onAddApplication(tareaActiva)}
                                    className={cn(
                                        "w-full md:w-auto px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                                        esVencida ? "bg-rose-600 shadow-rose-600/20 hover:bg-rose-700" : "bg-slate-900 shadow-slate-900/20 hover:bg-slate-800"
                                    )}
                                >
                                    <Check className="w-4 h-4" />
                                    Registrar Aplicación
                                </button>
                                <button
                                    onClick={() => setIsOmitting(tareaActiva.id)}
                                    className="w-full md:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Omitir Hoy
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                {progressPercent > 0 && (
                    <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                        <div className={cn(
                            "h-full animate-progress-glow",
                            esVencida ? "bg-rose-500" : "bg-amber-500"
                        )} style={{ width: `${progressPercent}%` }} />
                    </div>
                )}
            </div>

            {tareas.length > 1 && (
                <div className="mt-2 flex items-center gap-2 justify-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <Info className="w-3.5 h-3.5" />
                    Tienes {tareas.length - 1} aplicaciones más pendientes
                </div>
            )}
        </div>
    )
}
