'use client'

import { Thermometer } from 'lucide-react'
import { DeviceCard } from '@/components/dashboard'
import { Cultivo } from '@/lib/types/api'
import { TimeRange } from '@/lib/utils/mock-sensor-data'

interface ClimaTabProps {
    cultivo: Cultivo
    onToggleActuador: (actuadorId: number, currentState: boolean) => Promise<void>
    onRefresh: () => void
    dataLoading: boolean
    timeRange: TimeRange
    setTimeRange: (range: TimeRange) => void
}

export function ClimaTab({
    cultivo,
    onToggleActuador,
    onRefresh,
    dataLoading,
    timeRange,
    setTimeRange
}: ClimaTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Thermometer className="w-7 h-7 text-sky-500" />
                    Monitoreo de Clima
                </h2>
            </div>

            {cultivo.sala?.dispositivos && cultivo.sala.dispositivos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cultivo.sala.dispositivos.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onToggleActuador={onToggleActuador}
                            onRefresh={onRefresh}
                            isRefreshing={dataLoading}
                            showDetailLink={true}
                            detailLinkPath={`/dispositivos/${device.id}`}
                            timeRange={timeRange}
                            onTimeRangeChange={setTimeRange}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Thermometer className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Sin dispositivos climáticos</h3>
                    <p className="text-slate-500">No hay dispositivos vinculados a esta sala para el monitoreo.</p>
                </div>
            )}
        </div>
    )
}
