'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchVariedades, deleteVariedad } from '@/lib/api/catalogos-service'
import { Variedad } from '@/lib/types/api'
import { LoadingSpinner, Button } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { VarietyCard } from '@/components/catalogos/variety-card'
import { Plus, Dna, Search } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { CreateVariedadForm } from '@/components/forms/create-variedad-form'
import { useToast } from '@/providers/toast-provider'

export default function VariedadesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedVariedad, setSelectedVariedad] = useState<Variedad | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data: variedades, isLoading } = useQuery({
        queryKey: ['variedades'],
        queryFn: fetchVariedades
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteVariedad(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['variedades'] })
            showToast('Variedad eliminada correctamente', 'success')
        },
        onError: () => {
            showToast('Error al eliminar la variedad. Asegúrate de que no esté en uso.', 'error')
        }
    })

    const handleEdit = (v: Variedad) => {
        setSelectedVariedad(v)
        setIsModalOpen(true)
    }

    const handleDelete = (v: Variedad) => {
        if (window.confirm(`¿Estás seguro de eliminar la variedad "${v.nombre}"?`)) {
            deleteMutation.mutate(v.id)
        }
    }

    const handleAdd = () => {
        setSelectedVariedad(null)
        setIsModalOpen(true)
    }

    const filteredVariedades = variedades?.filter(v =>
        v.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.banco?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.tipo?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader title="Catálogo de Variedades" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-[var(--text-3xl)] font-black text-slate-900 tracking-tight">Variedades Genéticas</h1>
                        <p className="text-description mt-1">Biblioteca de semillas y clones disponibles para tus cultivos.</p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-indigo-600/20 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        AÑADIR
                    </button>
                </div>

                {/* Search Bar Pro Max */}
                <div className="relative mb-12 group">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-[3rem] -z-10 transition-opacity !opacity-0 group-focus-within:!opacity-100" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre, banco o tipo (Híbrida, Sativa...)"
                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:bg-white transition-all text-sm font-medium shadow-sm"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <LoadingSpinner size="xl" text="Analizando base de datos genética..." />
                    </div>
                ) : filteredVariedades && filteredVariedades.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredVariedades.map((v) => (
                            <VarietyCard
                                key={v.id}
                                variedad={v}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-[3rem] p-24 text-center max-w-4xl mx-auto shadow-sm">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-100 shadow-inner">
                            <Dna className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                            {searchQuery ? 'No se encontraron resultados' : 'Tu catálogo está vacío'}
                        </h3>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
                            {searchQuery
                                ? `No hay variedades que coincidan con "${searchQuery}". Prueba con otros términos.`
                                : 'Registra las variedades que tienes disponibles para empezar a crear ciclos de cultivo.'
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleAdd}
                                className="mt-10 px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95"
                            >
                                CREAR MI PRIMERA VARIEDAD
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedVariedad(null)
                }}
                title={selectedVariedad ? "Editar Perfil Genético" : "Registrar Nueva Genética"}
                maxWidth="3xl"
            >
                <CreateVariedadForm
                    onSuccess={() => {
                        setIsModalOpen(false)
                        setSelectedVariedad(null)
                        queryClient.invalidateQueries({ queryKey: ['variedades'] })
                    }}
                    onCancel={() => {
                        setIsModalOpen(false)
                        setSelectedVariedad(null)
                    }}
                    initialData={selectedVariedad}
                />
            </Modal>
        </div>
    )
}
