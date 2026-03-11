'use client'

import { ShieldAlert, Plus, Edit2, Trash2, Calendar, Bug, Droplets, Hand, MoreHorizontal, Activity, Hash, ShieldCheck, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import { ControlPlaga, ResumenControlPlaga } from '@/lib/types/api'

interface ControlPlagasTabProps {
    historialPlagas: ControlPlaga[]
    resumenPlagas?: ResumenControlPlaga
    onAddPlaga: () => void
    onEditPlaga: (log: ControlPlaga) => void
    onDeletePlaga: (logId: number) => void
    dataLoading: boolean
}

const metodoIcons: Record<string, any> = {
    'foliar': Bug,
    'riego': Droplets,
    'manual': Hand,
    'otro': MoreHorizontal
}

export function ControlPlagasTab({ historialPlagas, resumenPlagas, onAddPlaga, onEditPlaga, onDeletePlaga, dataLoading }: ControlPlagasTabProps) {

    return (
        <div className="space-y-[var(--space-md)] @container">
            <section className="bg-white rounded-3xl @[600px]:rounded-[2.5rem] border border-slate-200 p-4 @[600px]:p-10 shadow-sm min-h-[400px]">
                {/* Header Section */}
                <div className="flex flex-col @[500px]:flex-row @[500px]:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 @[600px]:w-12 @[600px]:h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm shrink-0">
                            <ShieldAlert className="w-5 h-5 @[600px]:w-6 @[600px]:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg @[600px]:text-2xl font-black text-slate-800 leading-tight">Control de Plagas</h2>
                            <p className="text-[10px] @[600px]:text-sm text-slate-400 font-bold">Historial de aplicaciones</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {resumenPlagas && (
                            <div className="hidden @[700px]:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block leading-none">Cumplimiento</span>
                                    <span className="text-sm font-black text-slate-900">{resumenPlagas.porcentaje_cumplimiento}%</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center relative shadow-sm shrink-0">
                                    <svg className="w-8 h-8 -rotate-90">
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="14"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className="text-slate-100"
                                        />
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="14"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeDasharray={88}
                                            strokeDashoffset={88 - (88 * resumenPlagas.porcentaje_cumplimiento) / 100}
                                            className={cn(
                                                resumenPlagas.porcentaje_cumplimiento > 80 ? "text-emerald-500" :
                                                    resumenPlagas.porcentaje_cumplimiento > 50 ? "text-amber-500" : "text-rose-500"
                                            )}
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={onAddPlaga}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl @[600px]:rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 text-xs @[600px]:text-sm shrink-0"
                        >
                            <Plus className="w-4 h-4 text-rose-400" />
                            <span className="whitespace-nowrap">Nuevo Registro</span>
                        </button>
                    </div>
                </div>

                {dataLoading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner text="Cargando historial..." />
                    </div>
                ) : historialPlagas && historialPlagas.length > 0 ? (
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
                        {[...historialPlagas].sort((a, b) => new Date(b.fecha_aplicacion).getTime() - new Date(a.fecha_aplicacion).getTime()).map((log) => {
                            const Icon = metodoIcons[log.metodo_aplicacion] || Bug
                            return (
                                <div key={log.id} className="relative flex items-start gap-4 @[800px]:gap-6 group">
                                    {/* Timeline Icon */}
                                    <div className={cn(
                                        "flex items-center justify-center w-10 h-10 @[800px]:w-12 @[800px]:h-12 rounded-full border-4 border-white shadow-sm shrink-0 z-10 transition-all duration-300 group-hover:scale-110",
                                        "bg-rose-500"
                                    )}>
                                        <Icon className="w-4 h-4 @[800px]:w-5 @[800px]:h-5 text-white" />
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-white @[800px]:bg-slate-50/50 rounded-2xl @[800px]:rounded-[2rem] border border-slate-100 p-4 @[800px]:p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all group/card">
                                        <div className="flex flex-col @[600px]:flex-row @[600px]:items-center justify-between gap-3 mb-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                                        Método: {log.metodo_aplicacion}
                                                    </span>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider",
                                                        log.tipo_aplicacion === 'preventivo'
                                                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                            : "bg-amber-50 border-amber-100 text-amber-600"
                                                    )}>
                                                        {log.tipo_aplicacion === 'preventivo' ? <ShieldCheck className="w-2.5 h-2.5" /> : <ShieldAlert className="w-2.5 h-2.5" />}
                                                        {log.tipo_aplicacion}
                                                    </div>
                                                    {log.intervalo_dias && (
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                            <Activity className="w-2.5 h-2.5" />
                                                            Cada {log.intervalo_dias} días
                                                        </div>
                                                    )}
                                                    {log.repeticiones_totales && (
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                            <Hash className="w-2.5 h-2.5" />
                                                            {log.repeticion_actual ? `Aplicación ${log.repeticion_actual} de ${log.repeticiones_totales}` : `${log.repeticiones_totales} Repeticiones`}
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-base @[800px]:text-xl font-black text-slate-900 flex items-center gap-2">
                                                    <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                                                    {log.nombre}
                                                </h3>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {formatLocalDate(log.fecha_aplicacion, { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 @[800px]:opacity-0 @[800px]:group-hover/card:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEditPlaga(log)}
                                                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDeletePlaga(log.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Products */}
                                        <div className="space-y-3">
                                            {log.productos && log.productos.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {log.productos.map((prod) => (
                                                        <div key={prod.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]">
                                                                    {prod.producto?.nombre}
                                                                </span>
                                                                {prod.producto?.fabricante && (
                                                                    <span className="text-[8px] font-semibold text-slate-400 truncate max-w-[150px]">
                                                                        {prod.producto.fabricante}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-black text-rose-600">
                                                                {prod.cantidad}{prod.unidad}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Repetitions mini-timeline */}
                                            {log.tareas && log.tareas.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-100">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Calendario de Aplicaciones</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {log.tareas
                                                            .sort((a, b) => a.repeticion_actual - b.repeticion_actual)
                                                            .map((tarea) => {
                                                                const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
                                                                    completada: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
                                                                    pendiente: { icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100' },
                                                                    vencida: { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 border-rose-100' },
                                                                    omitida: { icon: XCircle, color: 'text-slate-400 bg-slate-50 border-slate-100' },
                                                                }
                                                                const config = statusConfig[tarea.estado] || statusConfig.pendiente
                                                                const Icon = config.icon
                                                                return (
                                                                    <div
                                                                        key={tarea.id}
                                                                        className={cn(
                                                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold",
                                                                            config.color
                                                                        )}
                                                                        title={`${tarea.estado} · ${tarea.fecha_programada}`}
                                                                    >
                                                                        <Icon className="w-3.5 h-3.5" />
                                                                        <span className="font-black">#{tarea.repeticion_actual}</span>
                                                                        <span className="text-[9px] opacity-70">
                                                                            {formatLocalDate(tarea.fecha_programada, { day: 'numeric', month: 'short' })}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            })}
                                                    </div>
                                                </div>
                                            )}

                                            {log.notas && (
                                                <p className="text-[11px] text-slate-500 bg-slate-100/50 p-2.5 rounded-xl border border-slate-100/50 italic leading-relaxed">
                                                    {log.notas}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                            <ShieldAlert className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">Historial Vacío</h3>
                        <p className="text-xs text-slate-400 max-w-[240px] mx-auto font-medium">Aún no hay registros de control de plagas.</p>
                    </div>
                )}
            </section >
        </div >
    )
}
