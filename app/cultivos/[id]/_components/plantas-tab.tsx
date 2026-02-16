'use client'

import { Grid, Sprout, Plus, MapPin, Edit2, Trash2, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Cultivo, Planta } from '@/lib/types/api'

interface PlantasTabProps {
    cultivo: Cultivo
    onAddPlanta: (fila?: number, columna?: number) => void
    onEditPlanta: (planta: Planta) => void
    onDeletePlanta: (planta: Planta) => void
}

export function PlantasTab({ cultivo, onAddPlanta, onEditPlanta, onDeletePlanta }: PlantasTabProps) {
    const renderGrid = () => {
        const rows = cultivo.cama?.filas || 0
        const cols = cultivo.cama?.columnas || 0

        if (rows === 0 || cols === 0) return null

        const grid = []
        for (let r = 1; r <= rows; r++) {
            const rowCells = []
            for (let c = 1; c <= cols; c++) {
                const pos = `${r}-${c}`
                const planta = cultivo.plantas?.find(p => (p.fila === r && p.columna === c) || p.posicion === pos)
                rowCells.push(
                    <div
                        key={pos}
                        onClick={() => planta ? onEditPlanta(planta) : onAddPlanta(r, c)}
                        className={cn(
                            "aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer group relative",
                            planta
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-100/50"
                                : "bg-slate-50 border-slate-100 border-dashed hover:border-sky-300 hover:bg-sky-50 text-slate-300 hover:text-sky-500"
                        )}
                    >
                        {planta ? (
                            <>
                                <Sprout className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase truncate max-w-full px-1">
                                    {planta.codigo || `P-${planta.id}`}
                                </span>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 className="w-3 h-3 text-emerald-400" />
                                </div>
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[8px] font-bold mt-1 uppercase">{pos}</span>
                            </>
                        )}

                        {/* Tooltip for cell info */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold">
                            Fila {r}, Col {c} {planta ? '(Click para editar)' : '(Click para agregar)'}
                        </div>
                    </div>
                )
            }
            grid.push(
                <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                    {rowCells}
                </div>
            )
        }
        return <div className="space-y-3">{grid}</div>
    }

    return (
        <div className="space-y-8">
            {/* Grid View */}
            {(cultivo.cama?.filas || 0) > 0 && (
                <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                                <Grid className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 leading-tight">Mapa de la Cama</h2>
                                <p className="text-sm text-slate-400 font-medium">Distribución física de las plantas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200 border-dashed" />
                                Libre
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                                Ocupado
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                        <div className="w-full max-w-2xl px-2">
                            {renderGrid()}
                        </div>
                    </div>
                </section>
            )}

            {/* Inventory List */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 leading-tight">Inventario de Plantas</h2>
                            <p className="text-sm text-slate-400 font-medium">Lista detallada de ejemplares</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                            {cultivo.plantas?.length || 0} de {cultivo.cantidad_plantas || 0}
                        </span>
                        <button
                            onClick={() => onAddPlanta()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Planta
                        </button>
                    </div>
                </div>

                {cultivo.plantas && cultivo.plantas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...cultivo.plantas]
                            .sort((a, b) => {
                                if (a.fila !== b.fila) return (a.fila || 0) - (b.fila || 0);
                                return (a.columna || 0) - (b.columna || 0);
                            })
                            .map((planta) => (
                                <div key={planta.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-emerald-500 flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <Sprout className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID</span>
                                                <p className="font-bold text-slate-800 leading-none mt-0.5">{planta.codigo || `PLN-${planta.id}`}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEditPlanta(planta)}
                                                className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeletePlanta(planta)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-all active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                planta.estado === 'activa' ? "bg-emerald-400" :
                                                    planta.estado === 'cosechada' ? "bg-amber-400" : "bg-red-400"
                                            )} />
                                            {planta.estado}
                                        </div>
                                        {planta.fila && planta.columna ? (
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                Pos: {planta.fila}-{planta.columna}
                                            </span>
                                        ) : planta.posicion && (
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                Pos: {planta.posicion}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Sprout className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Sin plantas registradas</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            Empieza a registrar las plantas de este ciclo para darles seguimiento individual.
                        </p>
                    </div>
                )}
            </section>
        </div>
    )
}
