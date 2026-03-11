'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { fetchSalaById, deleteSala } from '@/lib/api/salas-service'
import { deleteCama } from '@/lib/api/camas-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/providers/toast-provider'
import { useAuthContext } from '@/lib/auth/auth-context'
import { useSala } from '@/hooks/use-sala'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import {
    Plus,
    ArrowLeft,
    Layers,
    Droplets,
    Settings,
    Trash2,
    Calendar,
    Layout,
    Edit2,
    Sprout,
    Cpu,
    ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { CreateCamaForm } from '@/components/forms/create-cama-form'
import { CreateSalaForm } from '@/components/forms/create-sala-form'
import { CreateCultivoForm } from '@/components/forms/create-cultivo-form'
import { Cama } from '@/lib/types/api'

export default function SalaDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthContext()
    const id = Number(params.id)

    // Modal states
    const [isAddCamaModalOpen, setIsAddCamaModalOpen] = useState(false)
    const [isEditSalaModalOpen, setIsEditSalaModalOpen] = useState(false)
    const [isEditCamaModalOpen, setIsEditCamaModalOpen] = useState(false)
    const [isAddCultivoModalOpen, setIsAddCultivoModalOpen] = useState(false)
    const [selectedCama, setSelectedCama] = useState<Cama | null>(null)

    // 4. Use custom hook for data fetching
    const { sala, camas, cultivos, isLoading: dataLoading } = useSala(id)
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const deleteSalaMutation = useMutation({
        mutationFn: () => deleteSala(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salas'] })
            showToast('Sala eliminada correctamente', 'success')
            router.push('/salas')
        },
        onError: () => {
            showToast('Error al eliminar la sala', 'error')
        }
    })

    const handleDeleteSala = () => {
        if (window.confirm('¿Estás seguro de eliminar esta sala? Se perderán todas las configuraciones asociadas.')) {
            deleteSalaMutation.mutate()
        }
    }

    const deleteCamaMutation = useMutation({
        mutationFn: (camaId: number) => deleteCama(camaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['camas', id] })
            showToast('Cama eliminada correctamente', 'success')
        },
        onError: () => {
            showToast('Error al eliminar la cama', 'error')
        }
    })

    const handleDeleteCama = (e: React.MouseEvent, camaId: number) => {
        e.stopPropagation()
        if (window.confirm('¿Estás seguro de eliminar esta cama?')) {
            deleteCamaMutation.mutate(camaId)
        }
    }

    const handleEditCama = (cama: Cama) => {
        setSelectedCama(cama)
        setIsEditCamaModalOpen(true)
    }

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingSpinner size="xl" text="Cargando detalles de la sala..." />
            </div>
        )
    }

    if (!sala) return null

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader title={`${sala.nombre}`} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-description text-[11px] mb-1 uppercase tracking-widest font-black opacity-70">
                                <Layout className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Salas de Cultivo</span>
                            </div>
                            <h1 className="text-[var(--text-3xl)] font-black text-slate-900 leading-tight">
                                {sala.nombre}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditSalaModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <Settings className="w-4 h-4" />
                            CONFIGURAR
                        </button>
                        <button
                            onClick={handleDeleteSala}
                            disabled={deleteSalaMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" />
                            ELIMINAR
                        </button>
                        <button
                            onClick={() => setIsAddCamaModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            AÑADIR CAMA
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Camas */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <h2>Superficies de cultivo en esta Sala</h2>
                                </div>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                                    {camas?.length || 0} {camas?.length === 1 ? 'Superficie' : 'Superficies'}
                                </span>
                            </div>

                            <div className="p-6">
                                {camas && camas.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {camas.map((cama) => {
                                            const cultivoActivo = cultivos?.find(c =>
                                                c.camaId === cama.id &&
                                                ['activo', 'esqueje', 'vegetativo', 'floracion', 'cosecha'].includes(c.estado)
                                            )

                                            return (
                                                <div
                                                    key={cama.id}
                                                    onClick={() => {
                                                        if (cultivoActivo) {
                                                            router.push(`/cultivos/${cultivoActivo.id}`)
                                                        } else {
                                                            setSelectedCama(cama)
                                                            setIsAddCultivoModalOpen(true)
                                                        }
                                                    }}
                                                    className="p-6 border border-slate-100 rounded-3xl hover:border-indigo-100 hover:shadow-xl transition-all group cursor-pointer relative flex flex-col h-full bg-white overflow-hidden"
                                                >
                                                    {/* Pro Max Decorative Blob */}
                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />

                                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                            {cama.nombre}
                                                        </h4>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleEditCama(cama)
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteCama(e, cama.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {cultivoActivo ? (
                                                        <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 relative z-10">
                                                            <div className="flex items-center gap-2 text-emerald-700 font-black text-xs mb-1 uppercase tracking-tight">
                                                                <Sprout className="w-3.5 h-3.5" />
                                                                {cultivoActivo.nombre}
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] text-emerald-600/70 font-black uppercase tracking-widest">
                                                                    {cultivoActivo.estado}
                                                                </span>
                                                                <span className="text-[10px] text-emerald-600/70 font-black">
                                                                    Día {cultivoActivo.dias_ciclo || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                                            {cama.descripcion || 'Sin descripción adicional'}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between mt-auto mb-4">
                                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {new Date(cama.creado_en || Date.now()).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {cama.capacidad_plantas && (
                                                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                                                                Superficie {cama.filas}x{cama.columnas}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={cn(
                                                        "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 group/btn relative z-10 shadow-sm",
                                                        cultivoActivo
                                                            ? "bg-slate-50 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-600/20"
                                                            : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-emerald-600/20"
                                                    )}>
                                                        {cultivoActivo ? 'VER CULTIVO' : 'INICIAR CULTIVO'}
                                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-500">No hay camas registradas en esta sala.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar: Stats & Info */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-500" />
                                Información de Sala
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Descripción
                                    </span>
                                    <p className="text-slate-700 font-medium">
                                        {sala.descripcion || 'Sin descripción proporcionada'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <Droplets className="w-5 h-5 text-emerald-500 mb-2" />
                                    <span className="text-xs font-semibold text-emerald-400 uppercase block">Superficies Activas</span>
                                    <p className="text-emerald-900 font-bold text-lg">{camas?.length || 0}</p>
                                </div>
                            </div>
                        </section>

                        {/* Dispositivos Asociados */}
                        {user?.modulos?.some(m => m.slug === 'dispositivos') && (
                            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-indigo-500" />
                                    Dispositivos
                                </h3>

                                <div className="space-y-3">
                                    {sala.dispositivos && sala.dispositivos.length > 0 ? (
                                        sala.dispositivos.map((device) => (
                                            <div
                                                key={device.id}
                                                onClick={() => router.push(`/dispositivos/${device.id}`)}
                                                className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                                                    <Cpu className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">
                                                        {device.nombre}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        {device.ip || 'Local Network'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-slate-400 text-xs font-medium">No hay dispositivos vinculados.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para Crear Cama */}
            <Modal
                isOpen={isAddCamaModalOpen}
                onClose={() => setIsAddCamaModalOpen(false)}
                title="Agregar Nueva Cama"
                maxWidth="2xl"
            >
                <CreateCamaForm
                    salaId={id}
                    onSuccess={() => setIsAddCamaModalOpen(false)}
                    onCancel={() => setIsAddCamaModalOpen(false)}
                />
            </Modal>

            {/* Modal para Editar Sala */}
            <Modal
                isOpen={isEditSalaModalOpen}
                onClose={() => setIsEditSalaModalOpen(false)}
                title="Editar Sala de Cultivo"
                maxWidth="5xl"
            >
                <CreateSalaForm
                    initialData={sala}
                    onSuccess={() => setIsEditSalaModalOpen(false)}
                    onCancel={() => setIsEditSalaModalOpen(false)}
                />
            </Modal>

            {/* Modal para Editar Cama */}
            <Modal
                isOpen={isEditCamaModalOpen}
                onClose={() => {
                    setIsEditCamaModalOpen(false)
                    setSelectedCama(null)
                }}
                title="Editar Cama"
                maxWidth="2xl"
            >
                {selectedCama && (
                    <CreateCamaForm
                        salaId={id}
                        initialData={selectedCama}
                        onSuccess={() => {
                            setIsEditCamaModalOpen(false)
                            setSelectedCama(null)
                        }}
                        onCancel={() => {
                            setIsEditCamaModalOpen(false)
                            setSelectedCama(null)
                        }}
                    />
                )}
            </Modal>

            {/* Modal para Iniciar Cultivo */}
            <Modal
                isOpen={isAddCultivoModalOpen}
                onClose={() => {
                    setIsAddCultivoModalOpen(false)
                    setSelectedCama(null)
                }}
                title="Iniciar Nuevo Cultivo"
                maxWidth="5xl"
            >
                {selectedCama && (
                    <CreateCultivoForm
                        initialSalaId={id}
                        initialCamaId={selectedCama.id}
                        onSuccess={() => {
                            setIsAddCultivoModalOpen(false)
                            setSelectedCama(null)
                            queryClient.invalidateQueries({ queryKey: ['cultivos-sala', id] })
                        }}
                        onCancel={() => {
                            setIsAddCultivoModalOpen(false)
                            setSelectedCama(null)
                        }}
                    />
                )}
            </Modal>
        </div>
    )
}
