'use client'

import { useQuery } from '@tanstack/react-query'
import { formatTimestamp, type SensorType, type TimeRange } from '@/lib/utils/mock-sensor-data'
import { fetchHistoricalData } from '@/lib/api/devices-service'
import { useMemo } from 'react'

interface SensorChartProps {
    sensorType: SensorType
    sensorId: number
    deviceId: number
    currentValue: number
    unit: string
    label: string
    timeRange: TimeRange
}

export function SensorChart({ sensorType, sensorId, deviceId, currentValue, unit, label, timeRange }: SensorChartProps) {
    // Convert timeRange to hours
    const horasMap: Record<TimeRange, number> = {
        '1H': 1,
        '12H': 12,
        '24H': 24
    }
    const horas = horasMap[timeRange]

    // Fetch historical data from backend
    const { data: historicalData, isLoading } = useQuery({
        queryKey: ['historicalData', deviceId, sensorId, horas],
        queryFn: () => fetchHistoricalData(deviceId, horas),
        refetchInterval: 60000,
    })

    const sensorData = historicalData?.sensores.find(s => s.sensorId === sensorId)

    // Calculate Sparkline Data
    const sparklineData = useMemo(() => {
        if (!sensorData?.datos || sensorData.datos.length === 0) return null

        const data = sensorData.datos.map(d => d.valor)
        const min = Math.min(...data)
        const max = Math.max(...data)
        const range = max - min || 1

        // Dimensions
        const width = 100
        const height = 100 // Internal SVG coordinate system
        const padding = 5

        // Generate points
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * (width - 2 * padding) + padding
            // Invert Y because SVG connects from top-left
            const normalizedY = (val - min) / range
            const y = height - (normalizedY * (height - 2 * padding) + padding)
            return `${x},${y}`
        }).join(' ')

        // Create fill path (close the loop at the bottom)
        const firstPoint = points.split(' ')[0]
        const lastPoint = points.split(' ')[points.split(' ').length - 1]
        const fillPath = `M ${firstPoint.split(',')[0]},${height} L ${points} L ${lastPoint.split(',')[0]},${height} Z`

        return { points, fillPath, min, max }
    }, [sensorData])

    const getColors = () => {
        switch (sensorType) {
            case 'temperatura':
                return { stroke: '#f59e0b', fill: '#fef3c7' } // amber-500, amber-100
            case 'humedad':
                return { stroke: '#06b6d4', fill: '#cffafe' } // cyan-500, cyan-100
            case 'vpd':
                return { stroke: '#8b5cf6', fill: '#ede9fe' } // violet-500, violet-100
            case 'co2':
                return { stroke: '#10b981', fill: '#d1fae5' } // emerald-500, emerald-100
            default:
                return { stroke: '#64748b', fill: '#f1f5f9' }
        }
    }

    const colors = getColors()

    if (isLoading) {
        return (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-16 bg-slate-200 rounded"></div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-lg ${sensorType === 'temperatura' ? 'bg-amber-100' :
                            sensorType === 'humedad' ? 'bg-cyan-100' :
                                sensorType === 'vpd' ? 'bg-violet-100' :
                                    'bg-emerald-100'
                            }`}>
                            {/* Icons rendered conditionally based on type */}
                            {sensorType === 'temperatura' && (
                                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            )}
                            {sensorType === 'humedad' && (
                                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                            )}
                            {sensorType === 'vpd' && (
                                <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                            {sensorType === 'co2' && (
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-700 capitalize">{sensorType}</h4>
                            <p className="text-[10px] text-slate-500">{label}</p>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-slate-800">
                            {currentValue}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{unit}</span>
                    </div>
                </div>
            </div>

            <div className="h-16 w-full -mx-1 relative overflow-hidden">
                {sparklineData ? (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d={sparklineData.fillPath} fill={colors.fill} fillOpacity="0.4" />
                        <polyline points={sparklineData.points} fill="none" stroke={colors.stroke} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 italic">
                        Sin datos históricos
                    </div>
                )}
            </div>
        </div>
    )
}
