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
                    <div className="flex flex-col @[700px]:flex-row @[700px]:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
                                <Grid className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 leading-tight">Mapa de la Cama</h2>
                                <p className="text-sm text-slate-400 font-bold">Distribución física</p>
                            </div>
                        </div>
                        <div className="flex flex-col @[500px]:flex-row @[500px]:items-center gap-3 @[500px]:gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-tighter">
                                    <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200 border-dashed" />
                                    Libre
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-tighter">
                                    <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                                    Ocupado
                                </div>
                            </div>
                            <button
                                onClick={() => onAddPlanta()}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95 shrink-0"
                            >
                                <Plus className="w-4 h-4 text-sky-400" />
                                Agregar Planta
                            </button>
                        </div>
                    </div>

                    <div className="p-2 @[500px]:p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-x-auto">
                        <div className="min-w-fit mx-auto px-2">
                            {renderGrid()}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
