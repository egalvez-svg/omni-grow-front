'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import {
    deletePlanta,
    deleteNutricion,
    deleteCultivo
} from '@/lib/api/cultivos-service'
import { ejecutarAccionActuador } from '@/lib/api/devices-service'
import { useCultivo } from '@/hooks/use-cultivo'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { useAuthContext } from '@/lib/auth/auth-context'
import { useToast } from '@/providers/toast-provider'
import {
    ArrowLeft,
    Sprout,
    Calendar,
    ClipboardList,
    FlaskConical,
    Activity,
    Edit2,
    Trash2,
    Thermometer,
    Sparkles,
    AlertCircle,
    Dna,
    Beaker
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { CreatePlantaForm } from '@/components/forms/create-planta-form'
import { CreateNutricionForm } from '@/components/forms/create-nutricion-form'
import { CreateCultivoForm } from '@/components/forms/create-cultivo-form'
import { ChangePhaseForm } from '@/components/forms/change-phase-form'
import { AIAnalysisView } from '@/components/cultivos/ai-analysis-view'
import { Planta, NutricionSemanal } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'

// Tab Components
import { OverviewTab } from './_components/overview-tab'
import { PlantasTab } from './_components/plantas-tab'
import { NutricionTab } from './_components/nutricion-tab'
import { ClimaTab } from './_components/clima-tab'

const phaseStyles: Record<string, { color: string, bg: string }> = {
    'semilla': { color: 'text-amber-700', bg: 'bg-amber-100' },
    'esqueje': { color: 'text-teal-700', bg: 'bg-teal-100' },
    'vegetativo': { color: 'text-blue-700', bg: 'bg-blue-100' },
    'floracion': { color: 'text-purple-700', bg: 'bg-purple-100' },
    'cosecha': { color: 'text-orange-700', bg: 'bg-orange-100' },
    'secado': { color: 'text-slate-700', bg: 'bg-slate-100' },
    'curado': { color: 'text-emerald-700', bg: 'bg-emerald-100' },
}

const getPhaseStyle = (slug: string) => {
    return phaseStyles[slug] || { color: 'text-sky-700', bg: 'bg-sky-100' }
}

export default function CultivoDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthContext()
    const id = Number(params.id)
    const [activeTab, setActiveTab] = useState<'info' | 'plantas' | 'nutricion' | 'clima' | 'analisis'>('info')
    const [timeRange, setTimeRange] = useState<TimeRange>('12H')

    // Modal states
    const [isAddPlantaModalOpen, setIsAddPlantaModalOpen] = useState(false)
    const [isEditPlantaModalOpen, setIsEditPlantaModalOpen] = useState(false)
    const [isAddNutricionModalOpen, setIsAddNutricionModalOpen] = useState(false)
    const [isEditNutricionModalOpen, setIsEditNutricionModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isChangePhaseModalOpen, setIsChangePhaseModalOpen] = useState(false)

    const [selectedFila, setSelectedFila] = useState<number | undefined>(undefined)
    const [selectedColumna, setSelectedColumna] = useState<number | undefined>(undefined)
    const [selectedPlanta, setSelectedPlanta] = useState<Planta | null>(null)
    const [selectedNutricion, setSelectedNutricion] = useState<NutricionSemanal | null>(null)

    // Data fetching
    const { cultivo, historialNutricion, isLoading: dataLoading } = useCultivo(id)

    const queryClient = useQueryClient()
    const { showToast } = useToast()

    // Mutations
    const deletePlantaMutation = useMutation({
        mutationFn: (plantaId: number) => deletePlanta(plantaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivo', id] })
            showToast('Planta eliminada correctamente', 'success')
        },
        onError: () => showToast('Error al eliminar la planta', 'error')
    })

    const deleteNutricionMutation = useMutation({
        mutationFn: (logId: number) => deleteNutricion(logId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nutricion', id] })
            showToast('Registro de nutrición eliminado', 'success')
        },
        onError: () => showToast('Error al eliminar el registro', 'error')
    })

    const deleteCultivoMutation = useMutation({
        mutationFn: () => deleteCultivo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivos'] })
            showToast('Ciclo de cultivo eliminado', 'success')
            router.push('/cultivos')
        },
        onError: () => showToast('Error al eliminar el ciclo de cultivo', 'error')
    })

    // Handlers
    const handleDeleteCultivo = () => {
        if (window.confirm('¿Estás seguro de eliminar este ciclo de cultivo? Esta acción eliminará permanentemente todos los registros y plantas asociados.')) {
            deleteCultivoMutation.mutate()
        }
    }

    const handleDeletePlanta = (planta: Planta) => {
        if (!planta.id) return
        if (window.confirm(`¿Estás seguro de eliminar la planta ${planta.codigo || ''}? Esta acción no se puede deshacer.`)) {
            deletePlantaMutation.mutate(planta.id)
        }
    }

    const handleDeleteNutricion = (logId: number) => {
        if (window.confirm('¿Estás seguro de eliminar este registro de nutrición?')) {
            deleteNutricionMutation.mutate(logId)
        }
    }

    const handleAddPlanta = (r?: number, c?: number) => {
        setSelectedFila(r)
        setSelectedColumna(c)
        setIsAddPlantaModalOpen(true)
    }

    const handleEditPlanta = (planta: Planta) => {
        setSelectedPlanta(planta)
        setIsEditPlantaModalOpen(true)
    }

    const handleEditNutricion = (log: NutricionSemanal) => {
        setSelectedNutricion(log)
        setIsEditNutricionModalOpen(true)
    }

    const handleToggleActuador = async (actuadorId: number, currentState: boolean) => {
        try {
            const accion = currentState ? 'apagar' : 'encender'
            await ejecutarAccionActuador(actuadorId, accion)
            queryClient.invalidateQueries({ queryKey: ['cultivo', id] })
        } catch (error) {
            console.error('Error toggling actuador:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error al controlar el actuador'
            showToast(errorMessage, 'error')
        }
    }

    // Memoized values
    const ultimoRiego = useMemo(() => {
        if (!historialNutricion || historialNutricion.length === 0) return null
        return [...historialNutricion].sort((a, b) =>
            new Date(b.fecha_aplicacion).getTime() - new Date(a.fecha_aplicacion).getTime()
        )[0]
    }, [historialNutricion])

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="xl" text="Analizando ciclo de cultivo..." />
            </div>
        )
    }

    if (!cultivo) return null

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader title={`Cultivo: ${cultivo.nombre}`} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => router.back()}
                            className="mt-1 p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {cultivo.faseActual ? (
                                    (() => {
                                        const style = getPhaseStyle(cultivo.faseActual.slug);
                                        return (
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                style.bg,
                                                style.color
                                            )}>
                                                {cultivo.faseActual.nombre}
                                            </span>
                                        );
                                    })()
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                                        Sin Fase
                                    </span>
                                )}
                                <span className="text-slate-400 text-sm flex items-center gap-1.5 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    Iniciado: {formatLocalDate(cultivo.fecha_inicio)}
                                </span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                                {cultivo.nombre}
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                                <Dna className="w-4 h-4 text-sky-500" />
                                {cultivo.variedades && cultivo.variedades.length > 0 ? (
                                    <>
                                        {cultivo.variedades.length > 1 ? (
                                            <span className="text-slate-800 font-bold">{cultivo.variedades.length} Variedades</span>
                                        ) : (
                                            <>
                                                Variedad: <span className="text-slate-800 font-bold">{cultivo.variedades[0].nombre}</span>
                                            </>
                                        )}
                                    </>
                                ) : cultivo.variedad ? (
                                    <>
                                        Variedad: <span className="text-slate-800 font-bold">{cultivo.variedad.nombre}</span>
                                    </>
                                ) : (
                                    <>
                                        Variedad: <span className="text-slate-800 font-bold">General</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsChangePhaseModalOpen(true)}
                            className="px-6 py-3 bg-white border border-slate-200 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Cambiar Etapa
                        </button>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Editar
                        </button>
                        <button
                            onClick={handleDeleteCultivo}
                            disabled={deleteCultivoMutation.isPending}
                            className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar Ciclo
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-3xl mb-10 shadow-sm w-fit">
                    {[
                        { id: 'info', icon: ClipboardList, label: 'Visión General' },
                        { id: 'plantas', icon: Sprout, label: 'Plantas' },
                        { id: 'nutricion', icon: FlaskConical, label: 'Plan Nutricional' },
                        { id: 'clima', icon: Thermometer, label: 'Clima', slug: 'dispositivos' },
                        { id: 'analisis', icon: Sparkles, label: 'Análisis IA' },
                    ].filter(tab => {
                        if (tab.slug === 'dispositivos') {
                            return user?.modulos?.some(m => m.slug === 'dispositivos')
                        }
                        return true
                    }).map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-sky-400" : "text-slate-400")} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'info' && (
                        <OverviewTab cultivo={cultivo} ultimoRiego={ultimoRiego} />
                    )}

                    {activeTab === 'plantas' && (
                        <PlantasTab
                            cultivo={cultivo}
                            onAddPlanta={handleAddPlanta}
                            onEditPlanta={handleEditPlanta}
                            onDeletePlanta={handleDeletePlanta}
                        />
                    )}

                    {activeTab === 'nutricion' && (
                        <NutricionTab
                            historialNutricion={historialNutricion || []}
                            onAddNutricion={() => setIsAddNutricionModalOpen(true)}
                            onEditNutricion={handleEditNutricion}
                            onDeleteNutricion={handleDeleteNutricion}
                            dataLoading={dataLoading}
                        />
                    )}

                    {activeTab === 'clima' && (
                        <ClimaTab
                            cultivo={cultivo}
                            onToggleActuador={handleToggleActuador}
                            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['cultivo', id] })}
                            dataLoading={dataLoading}
                            timeRange={timeRange}
                            setTimeRange={setTimeRange}
                        />
                    )}

                    {activeTab === 'analisis' && (
                        <AIAnalysisView cultivoId={id} />
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isAddPlantaModalOpen || isEditPlantaModalOpen}
                onClose={() => {
                    setIsAddPlantaModalOpen(false)
                    setIsEditPlantaModalOpen(false)
                    setSelectedFila(undefined)
                    setSelectedColumna(undefined)
                    setSelectedPlanta(null)
                }}
                title={isEditPlantaModalOpen ? "Editar Información de Planta" : "Registrar Nueva Planta"}
            >
                {!isEditPlantaModalOpen && (
                    <div className="mb-6 p-4 bg-emerald-50 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Ubicación Estratégica</p>
                            <p className="text-xs text-emerald-600">
                                Registrar plantas con su posición exacta permite un control preciso de su crecimiento y salud.
                            </p>
                        </div>
                    </div>
                )}
                <CreatePlantaForm
                    cultivoId={id}
                    variedades={cultivo.variedades || (cultivo.variedad ? [cultivo.variedad] : [])}
                    initialData={selectedPlanta || undefined}
                    fila={selectedFila}
                    columna={selectedColumna}
                    maxFilas={cultivo.cama?.filas}
                    maxColumnas={cultivo.cama?.columnas}
                    onSuccess={() => {
                        setIsAddPlantaModalOpen(false)
                        setIsEditPlantaModalOpen(false)
                        setSelectedFila(undefined)
                        setSelectedColumna(undefined)
                        setSelectedPlanta(null)
                    }}
                    onCancel={() => {
                        setIsAddPlantaModalOpen(false)
                        setIsEditPlantaModalOpen(false)
                        setSelectedFila(undefined)
                        setSelectedColumna(undefined)
                        setSelectedPlanta(null)
                    }}
                />
            </Modal>

            <Modal
                isOpen={isAddNutricionModalOpen}
                onClose={() => setIsAddNutricionModalOpen(false)}
                title="Nuevo Registro de Riego y Nutrición"
                maxWidth="4xl"
            >
                <div className="mb-8 p-6 bg-sky-50 rounded-[2rem] border border-sky-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-sky-600 shadow-sm border border-sky-100 shrink-0">
                        <FlaskConical className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-base font-black text-sky-900 leading-tight mb-1">Control de Precisión</p>
                        <p className="text-sm text-sky-600 font-medium leading-relaxed">
                            Registra los parámetros de pH y EC para optimizar la biodisponibilidad de nutrientes y prevenir bloqueos.
                        </p>
                    </div>
                </div>
                <CreateNutricionForm
                    cultivoId={id}
                    onSuccess={() => {
                        setIsAddNutricionModalOpen(false)
                        queryClient.invalidateQueries({ queryKey: ['nutricion', id] })
                    }}
                    onCancel={() => setIsAddNutricionModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isEditNutricionModalOpen}
                onClose={() => {
                    setIsEditNutricionModalOpen(false)
                    setSelectedNutricion(null)
                }}
                title="Editar Registro de Riego y Nutrición"
                maxWidth="4xl"
            >
                <div className="mb-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
                        <Edit2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-base font-black text-indigo-900 leading-tight mb-1">Modificación Técnica</p>
                        <p className="text-sm text-indigo-600 font-medium leading-relaxed">
                            Ajusta los valores históricos del riego o la mezcla de productos utilizada.
                        </p>
                    </div>
                </div>
                <CreateNutricionForm
                    cultivoId={id}
                    initialData={selectedNutricion}
                    onSuccess={() => {
                        setIsEditNutricionModalOpen(false)
                        setSelectedNutricion(null)
                        queryClient.invalidateQueries({ queryKey: ['nutricion', id] })
                    }}
                    onCancel={() => {
                        setIsEditNutricionModalOpen(false)
                        setSelectedNutricion(null)
                    }}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Ciclo de Cultivo"
            >
                <CreateCultivoForm
                    initialData={cultivo}
                    onSuccess={() => {
                        setIsEditModalOpen(false)
                        queryClient.invalidateQueries({ queryKey: ['cultivo', id] })
                    }}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isChangePhaseModalOpen}
                onClose={() => setIsChangePhaseModalOpen(false)}
                title="Actualizar Fase del Cultivo"
            >
                <ChangePhaseForm
                    cultivo={cultivo}
                    onSuccess={() => setIsChangePhaseModalOpen(false)}
                    onCancel={() => setIsChangePhaseModalOpen(false)}
                />
            </Modal>
        </div>
    )
}
