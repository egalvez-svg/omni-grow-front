'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/lib/auth/auth-context'
import { DeviceCard } from '@/components/dashboard'
import { LoadingSpinner, Card, Badge, StatCard, SensorChart } from '@/components/ui'
import { fetchUserDevices } from '@/lib/api/devices-service'
import { fetchUserSalas } from '@/lib/api/salas-service'
import { fetchWeather } from '@/lib/api/weather-service'
import { useToggleActuador } from '@/hooks/use-actuadores'
import type { Dispositivo, Sala } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'
import {
  Thermometer,
  Droplets,
  Zap,
  AlertTriangle,
  Leaf,
  ArrowRight,
  Wind
} from 'lucide-react'
import { cn } from '../lib/utils'

// Mock data generation for sparklines
const generateSparklineData = (base: number, variance: number, points: number = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    value: base + (Math.random() - 0.5) * variance,
    timestamp: new Date(Date.now() - (points - i) * 3600000).toISOString()
  }))
}

const tempData = generateSparklineData(24, 2)
const humidityData = generateSparklineData(65, 5)
const energyData = generateSparklineData(1.2, 0.3)

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deviceTimeRanges, setDeviceTimeRanges] = useState<Record<number, TimeRange>>({})

  // Queries
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useQuery<Dispositivo[]>({
    queryKey: ['userDevices', user?.id],
    queryFn: () => fetchUserDevices(user!.id),
    enabled: !!user?.id,
  })

  const { data: salas, isLoading: salasLoading } = useQuery<Sala[]>({
    queryKey: ['salas'],
    queryFn: fetchUserSalas,
    enabled: !!user?.id
  })

  const { data: weather } = useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    refetchInterval: 1000 * 60 * 15, // Actualizar cada 15 min
  })

  const activeAlertsCount = devices?.reduce((acc, device) => {
    // Aquí podrías definir qué se considera una alerta según el estado del dispositivo
    // Por ahora, si no hay datos recientes lo consideramos una alerta
    const isOffline = !device.ultimaActualizacion ||
      (new Date().getTime() - new Date(device.ultimaActualizacion).getTime() > 1000 * 60 * 10)
    return acc + (isOffline ? 1 : 0)
  }, 0) || 0

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchDevices()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const toggleActuadorMutation = useToggleActuador()

  const handleToggleActuador = async (actuadorId: number, currentState: boolean) => {
    const accion = currentState ? 'apagar' : 'encender'
    toggleActuadorMutation.mutate({ actuadorId, accion }, {
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Error al controlar el actuador'
        alert(errorMessage) // TODO: Use toast
      }
    })
  }

  const handleTimeRangeChange = (deviceId: number, range: TimeRange) => {
    setDeviceTimeRanges(prev => ({ ...prev, [deviceId]: range }))
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section Compacto */}
      <div className="mb-4 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">
            Hola, <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">{user?.nombre || 'Cultivador'}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Resumen general de tus espacios y dispositivos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="soft" className="px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            SISTEMA ONLINE
          </Badge>
        </div>
      </div>

      {/* KPI Grid (Bento Top) Compacto */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
        <StatCard
          title="Temp. Exterior"
          value={weather?.temperatura?.toString() || '--'}
          unit={weather?.unidad_temp || "°C"}
          icon={Thermometer}
          trend={undefined}
          color="rose"
        >
          <div className="mt-4 text-[10px] text-slate-400 font-medium">
            <p>Ubicación: {weather?.ubicacion?.city || 'Local'}</p>
            <p className="mt-1 italic uppercase">{weather?.condicion || '---'}</p>
          </div>
        </StatCard>

        <StatCard
          title="Humedad Exterior"
          value={weather?.humedad?.toString() || '--'}
          unit={weather?.unidad_hum || "%"}
          icon={Droplets}
          trend={undefined}
          color="indigo"
        >
          <div className="mt-4 text-[10px] text-slate-400 font-medium">
            <p>Condición estable</p>
          </div>
        </StatCard>

        <StatCard
          title="Consumo Energético"
          value="1.2"
          unit="kW/h"
          icon={Zap}
          trend="down"
          trendValue="4.3%"
          color="amber"
        >
          <SensorChart data={energyData} color="#f59e0b" />
        </StatCard>

        <StatCard
          title="Dispositivos Offline"
          value={activeAlertsCount.toString()}
          icon={AlertTriangle}
          color={activeAlertsCount > 0 ? "rose" : "emerald"}
        >
          <div className={cn(
            "flex items-center gap-2 mt-4 font-bold p-2 rounded-lg text-[10px] uppercase tracking-wider",
            activeAlertsCount > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
          )}>
            {activeAlertsCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Revisar conexiones</span>
              </>
            ) : (
              <>
                <Leaf className="w-3.5 h-3.5" />
                <span>Todo OK</span>
              </>
            )}
          </div>
        </StatCard>
      </div>

      {/* Main Content Grid Compacto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

        {/* Left Column: Salas (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-indigo-500" />
              Mis Espacios de Cultivo
            </h3>
            <Link href="/salas" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group">
              VER TODOS
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {salasLoading ? (
            <div className="h-40 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : !salas || salas.length === 0 ? (
            <Card variant="bordered" className="p-8 text-center border-dashed">
              <p className="text-slate-400 font-medium">No tienes espacios registrados</p>
              <Link href="/salas" className="text-indigo-600 font-bold text-sm mt-2 inline-block">crear uno nuevo</Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {salas.slice(0, 4).map(sala => (
                <Link key={sala.id} href={`/salas/${sala.id}`}>
                  <Card variant="glass" hover className="h-full flex flex-col justify-between group relative overflow-hidden">
                    {/* Pro Max Decorative Blob */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />

                    <div className="p-3 md:p-5 relative z-10">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <Leaf className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <Badge variant="neon" className="text-[9px] md:text-[10px] px-2 py-0.5">ACTIVO</Badge>
                      </div>

                      <h4 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">
                        {sala.nombre}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {sala.descripcion || "Sin descripción"}
                      </p>

                      <div className="flex items-center gap-3 text-xs font-medium text-slate-400 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Wind className="w-3 h-3" /> 2 Dispositivos
                        </span>
                        <span className="flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> 4 Variedades
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Devices List (1/3 width) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Dispositivos
            </h3>
            <button onClick={handleRefresh} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
              {isRefreshing ? 'ACTUALIZANDO...' : 'REFRESCAR'}
            </button>
          </div>

          {devicesLoading ? (
            <div className="h-40 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : !devices || devices.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-slate-500">Sin dispositivos activos</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {devices.slice(0, 3).map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onToggleActuador={handleToggleActuador}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                  detailLinkPath={`/dispositivos/${device.id}`}
                  timeRange={deviceTimeRanges[device.id] || '24H'}
                  onTimeRangeChange={(range) => handleTimeRangeChange(device.id, range)}
                  compact // Feature to add: Compact mode for sidebar widgets
                />
              ))}
              {devices.length > 3 && (
                <Link
                  href="/dispositivos"
                  className="block text-center py-3 text-xs font-bold text-indigo-600 bg-indigo-50/50 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  VER {devices.length - 3} MÁS
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
