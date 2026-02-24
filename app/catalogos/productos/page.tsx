'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProductos, deleteProducto, fetchProductoTipos } from '@/lib/api/catalogos-service'
import { Producto } from '@/lib/types/api'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard'
import { ProductCard } from '@/components/catalogos/product-card'
import { Plus, PackageSearch, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { CreateProductoForm } from '@/components/forms/create-producto-form'
import { useToast } from '@/providers/toast-provider'

export default function ProductosPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
    const [soloActivos] = useState(true)
    const [activeTab, setActiveTab] = useState<number | 'todos'>('todos')
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data: productos, isLoading } = useQuery({
        queryKey: ['productos', soloActivos],
        queryFn: () => fetchProductos(soloActivos)
    })

    const { data: tipos } = useQuery({
        queryKey: ['producto-tipos'],
        queryFn: fetchProductoTipos
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteProducto(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] })
            showToast('Producto eliminado correctamente', 'success')
        },
        onError: () => {
            showToast('Error al eliminar el producto. Asegúrate de que no esté vinculado a un plan.', 'error')
        }
    })

    const handleEdit = (p: Producto) => {
        setSelectedProducto(p)
        setIsModalOpen(true)
    }

    const handleDelete = (p: Producto) => {
        if (window.confirm(`¿Estás seguro de eliminar el producto "${p.nombre}"?`)) {
            deleteMutation.mutate(p.id)
        }
    }

    const handleAdd = () => {
        setSelectedProducto(null)
        setIsModalOpen(true)
    }

    const filteredProductos = useMemo(() => {
        if (!productos) return []

        return [...productos]
            .filter(p => {
                const matchesTab = activeTab === 'todos' || p.tipoId === activeTab
                return matchesTab
            })
            .sort((a, b) => {
                // Ordenar por nombre de categoría primero
                const catA = a.tipo?.nombre || 'zzz'
                const catB = b.tipo?.nombre || 'zzz'
                if (catA !== catB) return catA.localeCompare(catB)

                // Luego por nombre de producto
                return a.nombre.localeCompare(b.nombre)
            })
    }, [productos, activeTab])

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader title="Catálogo de Insumos" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-[var(--text-3xl)] font-black text-slate-900 tracking-tight">Inventario de Productos</h1>
                        <p className="text-description mt-1">Gestiona los fertilizantes y suplementos nutricionales de tu operación.</p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-emerald-600/20 group h-fit"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        NUEVO
                    </button>
                </div>

                {/* Filters & Tabs Pro Max */}
                <div className="flex flex-col gap-6 mb-12">
                    <div className="flex flex-col lg:flex-row items-center justify-start gap-6">
                        {/* Tab Selection Filter */}
                        <div className="flex flex-wrap items-center gap-3 p-1.5 bg-slate-100/30 rounded-[2rem] border border-slate-100/50 w-full lg:w-fit">
                            <button
                                onClick={() => setActiveTab('todos')}
                                className={cn(
                                    "flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                                    activeTab === 'todos'
                                        ? "bg-white text-emerald-600 shadow-md shadow-slate-200/50 scale-105 border-b-2 border-emerald-500"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                )}
                            >
                                TODOS
                            </button>
                            {tipos?.map((tipo) => {
                                const lowerName = tipo.nombre.toLowerCase()
                                const isNutricion = lowerName.includes('nutri') || lowerName.includes('abono') || lowerName.includes('fertil')
                                const isPreventivo = lowerName.includes('preven') || lowerName.includes('hongo') || lowerName.includes('fungi') || lowerName.includes('protec') || lowerName.includes('estimu')
                                const isCorrectivo = lowerName.includes('plaga') || lowerName.includes('insect') || lowerName.includes('correc') || lowerName.includes('acari') || lowerName.includes('bicho')
                                const isRiego = lowerName.includes('riego') || lowerName.includes('agua') || lowerName.includes('hidro')

                                return (
                                    <button
                                        key={tipo.id}
                                        onClick={() => setActiveTab(tipo.id)}
                                        className={cn(
                                            "flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                                            activeTab === tipo.id
                                                ? cn(
                                                    "bg-white shadow-md shadow-slate-200/50 scale-105 border-b-2",
                                                    isNutricion && "text-indigo-600 border-indigo-500",
                                                    isPreventivo && "text-amber-600 border-amber-500",
                                                    isCorrectivo && "text-rose-600 border-rose-500",
                                                    isRiego && "text-cyan-600 border-cyan-500",
                                                    !(isNutricion || isPreventivo || isCorrectivo || isRiego) && "text-emerald-600 border-emerald-500"
                                                )
                                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                        )}
                                    >
                                        {tipo.nombre}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <LoadingSpinner size="xl" text="Escaneando inventario..." />
                    </div>
                ) : filteredProductos && filteredProductos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProductos.map((p) => (
                            <ProductCard
                                key={p.id}
                                producto={p}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-[3rem] p-24 text-center max-w-4xl mx-auto shadow-sm">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-inner rotate-3">
                            <PackageSearch className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                            No hay productos registrados
                        </h3>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
                            Registra los fertilizantes y productos que usas para poder armar tus planes de nutrición.
                        </p>
                        <button
                            onClick={handleAdd}
                            className="mt-10 px-10 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 hover:-translate-y-1 active:scale-95"
                        >
                            AGREGAR MI PRIMER INSUMO
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedProducto(null)
                }}
                title={selectedProducto ? "Ficha Técnica de Producto" : "Registrar Insumo Nuevo"}
                maxWidth="3xl"
            >
                <CreateProductoForm
                    onSuccess={() => {
                        setIsModalOpen(false)
                        setSelectedProducto(null)
                        queryClient.invalidateQueries({ queryKey: ['productos'] })
                    }}
                    onCancel={() => {
                        setIsModalOpen(false)
                        setSelectedProducto(null)
                    }}
                    initialData={selectedProducto}
                />
            </Modal>
        </div>
    )
}
