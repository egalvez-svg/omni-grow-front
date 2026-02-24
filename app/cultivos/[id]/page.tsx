'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import {
    deletePlanta,
    deleteNutricion,
    deleteCultivo,
    deleteControlPlaga
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
    MapPin,
    Thermometer,
    Sparkles,
    AlertCircle,
    Dna,
    Beaker,
    ShieldAlert
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { CreatePlantaForm } from '@/components/forms/create-planta-form'
import { CreateNutricionForm } from '@/components/forms/create-nutricion-form'
import { CreatePestControlForm } from '@/components/forms/create-pest-control-form'
import { CreateCultivoForm } from '@/components/forms/create-cultivo-form'
import { ChangePhaseForm } from '@/components/forms/change-phase-form'
import { AIAnalysisView } from '@/components/cultivos/ai-analysis-view'
import { Planta, NutricionSemanal, ControlPlaga } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'

// Tab Components
import { OverviewTab } from './_components/overview-tab'
import { PlantasTab } from './_components/plantas-tab'
import { NutricionTab } from './_components/nutricion-tab'
import { ControlPlagasTab } from './_components/control-plagas-tab'
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
    const [activeTab, setActiveTab] = useState<'info' | 'plantas' | 'nutricion' | 'plagas' | 'clima' | 'analisis'>('info')
    const [timeRange, setTimeRange] = useState<TimeRange>('12H')

    // Modal states
    const [isAddPlantaModalOpen, setIsAddPlantaModalOpen] = useState(false)
    const [isEditPlantaModalOpen, setIsEditPlantaModalOpen] = useState(false)
    const [isAddNutricionModalOpen, setIsAddNutricionModalOpen] = useState(false)
    const [isEditNutricionModalOpen, setIsEditNutricionModalOpen] = useState(false)
    const [isAddPlagaModalOpen, setIsAddPlagaModalOpen] = useState(false)
    const [isEditPlagaModalOpen, setIsEditPlagaModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isChangePhaseModalOpen, setIsChangePhaseModalOpen] = useState(false)

    const [selectedFila, setSelectedFila] = useState<number | undefined>(undefined)
    const [selectedColumna, setSelectedColumna] = useState<number | undefined>(undefined)
    const [selectedPlanta, setSelectedPlanta] = useState<Planta | null>(null)
    const [selectedNutricion, setSelectedNutricion] = useState<NutricionSemanal | null>(null)
    const [selectedPlaga, setSelectedPlaga] = useState<ControlPlaga | null>(null)

    // Data fetching
    const {
        cultivo,
        historialNutricion,
        historialControlPlagas,
        timeline,
        isLoading: dataLoading
    } = useCultivo(id)

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

    const deletePlagaMutation = useMutation({
        mutationFn: (logId: number) => deleteControlPlaga(logId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['control-plagas', id] })
            showToast('Registro de control de plagas eliminado', 'success')
        },
        onError: () => showToast('Error al eliminar el registro', 'error')
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

    const handleDeletePlaga = (logId: number) => {
        if (window.confirm('¿Estás seguro de eliminar este registro de control de plagas?')) {
            deletePlagaMutation.mutate(logId)
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

    const handleEditPlaga = (log: ControlPlaga) => {
        setSelectedPlaga(log)
        setIsEditPlagaModalOpen(true)
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

    const ultimoControlPlaga = useMemo(() => {
        if (!historialControlPlagas || historialControlPlagas.length === 0) return null
        return [...historialControlPlagas].sort((a, b) =>
            new Date(b.fecha_aplicacion).getTime() - new Date(a.fecha_aplicacion).getTime()
        )[0]
    }, [historialControlPlagas])

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="xl" text="Analizando ciclo de cultivo..." />
            </div>
        )
    }

    if (!cultivo) return null

    return (
        <div className="h-[100dvh] flex flex-col bg-white overflow-hidden">
            <DashboardHeader title={`Cultivo: ${cultivo.nombre}`} />

            {/* Fixed Navigation Block Compacto */}
            <div className="flex-shrink-0 px-[var(--space-sm)] @[600px]:px-6 pt-3 @[600px]:pt-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section Compacto (UI/UX Pro Max) */}
                    <div className="flex flex-col gap-3 mb-3 @[600px]:mb-6">
                        {/* Fila Superior: Volver + Título + Acciones Secundarias */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-sky-600 transition-all shrink-0 shadow-sm"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-1.5 text-description text-[11px] font-black tracking-widest mb-1 uppercase opacity-70">
                                        <MapPin className="w-3 h-3 text-indigo-500" />
                                        <span>{cultivo.sala?.nombre} — {cultivo.cama?.nombre}</span>
                                    </div>
                                    <h1>{cultivo.nombre}</h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:text-sky-600 transition-all shadow-sm"
                                    title="Editar"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleDeleteCultivo}
                                    disabled={deleteCultivoMutation.isPending}
                                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-red-500 hover:bg-white transition-all shadow-sm"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Fila Inferior: Etapa (Acción Principal) + Meta-datos */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-100/50">
                            <div className="flex items-center gap-2">
                                {cultivo.faseActual && (
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm",
                                        getPhaseStyle(cultivo.faseActual.slug).bg,
                                        getPhaseStyle(cultivo.faseActual.slug).color
                                    )}>
                                        {cultivo.faseActual.nombre}
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                                    <Dna className="w-3.5 h-3.5 text-sky-500" />
                                    <span className="truncate max-w-[120px]">
                                        {cultivo.variedades && cultivo.variedades.length > 1 ? (
                                            <span className="bg-sky-500/20 text-sky-400 text-[11px] font-black px-2 py-1 rounded-lg border border-sky-500/30">
                                                {cultivo.variedades.length} Variedades
                                            </span>
                                        ) : (
                                            cultivo.variedades?.[0]?.nombre || cultivo.variedad?.nombre || 'General'
                                        )}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsChangePhaseModalOpen(true)}
                                className="bg-indigo-600 text-white text-[10px] md:text-xs font-black px-4 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
                            >
                                <Activity className="w-3.5 h-3.5" />
                                CAMBIAR ETAPA
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation Compacto */}
                    <div className="px-0 py-1.5 border-b border-slate-200/50 -mx-[var(--space-sm)] @[600px]:-mx-6 px-[var(--space-sm)] @[600px]:px-6">
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
                            {[
                                { id: 'info', icon: ClipboardList, label: 'Visión General', shortLabel: 'Info' },
                                { id: 'plantas', icon: Sprout, label: 'Plantas', shortLabel: 'Plantas' },
                                { id: 'nutricion', icon: FlaskConical, label: 'Plan Nutricional', shortLabel: 'Nutrición' },
                                { id: 'plagas', icon: ShieldAlert, label: 'Control Plagas', shortLabel: 'Plagas' },
                                { id: 'clima', icon: Thermometer, label: 'Clima', shortLabel: 'Clima', slug: 'dispositivos' },
                                { id: 'analisis', icon: Sparkles, label: 'Análisis IA', shortLabel: 'Análisis' },
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
                                            "flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-[11px] @[1000px]:text-xs font-black transition-all shrink-0 cursor-pointer whitespace-nowrap uppercase tracking-widest",
                                            isActive
                                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 -translate-y-0.5"
                                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5 shrink-0", isActive ? "text-sky-400" : "text-slate-400")} />
                                        <span className="hidden @[800px]:inline">{tab.label}</span>
                                        <span className="@[800px]:hidden">{tab.shortLabel}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Independent Scroll Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
                <div className="max-w-7xl mx-auto px-[var(--space-sm)] @[600px]:px-6 py-6 transition-all duration-300">
                    {activeTab === 'info' && (
                        <OverviewTab
                            cultivo={cultivo}
                            ultimoRiego={ultimoRiego}
                            ultimoControlPlaga={ultimoControlPlaga}
                            timeline={timeline}
                            isLoadingTimeline={dataLoading}
                        />
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

                    {activeTab === 'plagas' && (
                        <ControlPlagasTab
                            historialPlagas={historialControlPlagas || []}
                            onAddPlaga={() => setIsAddPlagaModalOpen(true)}
                            onEditPlaga={handleEditPlaga}
                            onDeletePlaga={handleDeletePlaga}
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
                        queryClient.invalidateQueries({ queryKey: ['timeline', id] })
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
                        queryClient.invalidateQueries({ queryKey: ['timeline', id] })
                    }}
                    onCancel={() => {
                        setIsEditNutricionModalOpen(false)
                        setSelectedNutricion(null)
                    }}
                />
            </Modal>

            <Modal
                isOpen={isAddPlagaModalOpen}
                onClose={() => setIsAddPlagaModalOpen(false)}
                title="Nuevo Registro de Control de Plagas"
                maxWidth="4xl"
            >
                <div className="mb-8 p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-base font-black text-rose-900 leading-tight mb-1">Protección del Cultivo</p>
                        <p className="text-sm text-rose-600 font-medium leading-relaxed">
                            Registra las aplicaciones de preventivos o tratamientos para mantener la salud de tus plantas.
                        </p>
                    </div>
                </div>
                <CreatePestControlForm
                    cultivoId={id}
                    onSuccess={() => {
                        setIsAddPlagaModalOpen(false)
                        queryClient.invalidateQueries({ queryKey: ['control-plagas', id] })
                        queryClient.invalidateQueries({ queryKey: ['timeline', id] })
                    }}
                    onCancel={() => setIsAddPlagaModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isEditPlagaModalOpen}
                onClose={() => {
                    setIsEditPlagaModalOpen(false)
                    setSelectedPlaga(null)
                }}
                title="Editar Registro de Control de Plagas"
                maxWidth="4xl"
            >
                <div className="mb-8 p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 shrink-0">
                        <Edit2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-base font-black text-rose-900 leading-tight mb-1">Modificación de Tratamiento</p>
                        <p className="text-sm text-rose-600 font-medium leading-relaxed">
                            Ajusta los detalles de la aplicación realizada para mantener un historial preciso.
                        </p>
                    </div>
                </div>
                <CreatePestControlForm
                    cultivoId={id}
                    initialData={selectedPlaga}
                    onSuccess={() => {
                        setIsEditPlagaModalOpen(false)
                        setSelectedPlaga(null)
                        queryClient.invalidateQueries({ queryKey: ['control-plagas', id] })
                        queryClient.invalidateQueries({ queryKey: ['timeline', id] })
                    }}
                    onCancel={() => {
                        setIsEditPlagaModalOpen(false)
                        setSelectedPlaga(null)
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
        </div >
    )
}
