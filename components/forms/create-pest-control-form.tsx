'use client'

import { useState, useMemo } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { registerControlPlaga, updateControlPlaga } from '@/lib/api/cultivos-service'
import { fetchProductos, fetchProductoTipos } from '@/lib/api/catalogos-service'
import { CreateControlPlagaDto, ControlPlaga, CreateControlPlagaDetalleDto, TareaControlPlaga, Producto } from '@/lib/types/api'
import { Plus, ShieldAlert, Bug, Droplets, Calendar, AlignLeft, Activity, Hash, Trash2, Check, Hand, MoreHorizontal, ShoppingBag, Tag } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { Select } from '@/components/ui'
import { useToast } from '@/providers/toast-provider'
import { cn } from '@/lib/utils'

interface CreatePestControlFormProps {
    cultivoId: number
    onSuccess: () => void
    onCancel: () => void
    initialData?: ControlPlaga | null
    tarea?: TareaControlPlaga
}

export function CreatePestControlForm({ cultivoId, onSuccess, onCancel, initialData, tarea }: CreatePestControlFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    // Fetch products and types
    const { data: productosCatalog = [] } = useQuery({
        queryKey: ['productos', 'activos'],
        queryFn: () => fetchProductos(true)
    })

    const { data: tiposProducto = [] } = useQuery({
        queryKey: ['productos-tipos'],
        queryFn: () => fetchProductoTipos()
    })

    // Filter products for Pest Control (Preventivo: 2, Control de Plagas: 3)
    const filteredProductos = useMemo(() => {
        // En base a la guía, los tipos son 2 y 3. 
        // Si tiposProducto está vacío (mientras carga), podemos usar los IDs 2 y 3 como fallback si fuera necesario,
        // pero esperaremos a la carga para ser precisos.
        return productosCatalog.filter(p => p.tipoId === 2 || p.tipoId === 3)
    }, [productosCatalog])

    const [fechaAplicacion, setFechaAplicacion] = useState(
        initialData?.fecha_aplicacion ? initialData.fecha_aplicacion.split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [metodoAplicacion, setMetodoAplicacion] = useState<'foliar' | 'riego' | 'manual' | 'otro'>(
        initialData?.metodo_aplicacion || (tarea?.controlPlaga?.metodo_aplicacion as any) || 'foliar'
    )
    const [tipoAplicacion, setTipoAplicacion] = useState<'preventivo' | 'combativo'>(
        initialData?.tipo_aplicacion || tarea?.tipo_aplicacion || 'preventivo'
    )
    const [intervaloDias, setIntervaloDias] = useState<string>(
        initialData?.intervalo_dias?.toString() || tarea?.controlPlaga?.intervalo_dias?.toString() || '15'
    )
    const [repeticiones, setRepeticiones] = useState<string>(
        initialData?.repeticiones_totales?.toString() || tarea?.controlPlaga?.repeticiones_totales?.toString() || '3'
    )
    const [nombre, setNombre] = useState(
        initialData?.nombre || tarea?.controlPlaga?.nombre || ''
    )
    const [notas, setNotas] = useState(initialData?.notas || '')
    const [selectedProductos, setSelectedProductos] = useState<(Omit<CreateControlPlagaDetalleDto, 'cantidad'> & { cantidad: string | number })[]>(
        initialData?.productos?.map(p => ({
            productoId: p.productoId,
            cantidad: p.cantidad.toString(),
            unidad: p.unidad as 'ml' | 'g'
        })) || tarea?.controlPlaga?.productos?.map((p: any) => ({
            productoId: p.productoId,
            cantidad: p.cantidad.toString(),
            unidad: p.unidad
        })) || []
    )

    const handleTipoChange = (newTipo: 'preventivo' | 'combativo') => {
        setTipoAplicacion(newTipo)
        // Suggest interval based on type
        setIntervaloDias(newTipo === 'preventivo' ? '15' : '3')
    }

    const mutation = useMutation({
        mutationFn: (data: CreateControlPlagaDto) => {
            if (initialData?.id) {
                return updateControlPlaga(initialData.id, data)
            }
            return registerControlPlaga(data)
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['control-plagas', cultivoId] }),
                queryClient.invalidateQueries({ queryKey: ['timeline', cultivoId] }),
                queryClient.invalidateQueries({ queryKey: ['tareas-pendientes', cultivoId] }),
                queryClient.invalidateQueries({ queryKey: ['resumen-plagas', cultivoId] }),
                queryClient.invalidateQueries({ queryKey: ['cultivo', cultivoId] })
            ])
            showToast(initialData ? '¡Registro actualizado!' : '¡Aplicación de control de plagas registrada!', 'success')
            onSuccess()
        },
        onError: () => {
            showToast(initialData ? 'Error al actualizar el registro' : 'Error al guardar el registro de control de plagas', 'error')
        }
    })

    const handleAddProduct = () => {
        setSelectedProductos([...selectedProductos, { productoId: 0, cantidad: "0", unidad: 'ml' }])
    }

    const handleRemoveProduct = (index: number) => {
        setSelectedProductos(selectedProductos.filter((_, i) => i !== index))
    }

    const handleProductChange = (index: number, field: string, value: any) => {
        const newProductos = [...selectedProductos]
        newProductos[index] = { ...newProductos[index], [field]: value }
        setSelectedProductos(newProductos)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedProductos.length === 0) {
            showToast('Debes agregar al menos un producto', 'error')
            return
        }

        const validProductos: CreateControlPlagaDetalleDto[] = selectedProductos
            .filter(p => p.productoId > 0 && parseFloat(p.cantidad.toString()) > 0)
            .map(p => ({
                productoId: p.productoId,
                cantidad: parseFloat(p.cantidad.toString()),
                unidad: p.unidad as 'ml' | 'g'
            }))

        if (validProductos.length === 0) {
            showToast('Asegúrate de seleccionar productos con cantidades válidas', 'error')
            return
        }

        const payload: CreateControlPlagaDto = {
            nombre: nombre || `Tratamiento ${tipoAplicacion}`,
            cultivoId,
            fecha_aplicacion: fechaAplicacion,
            metodo_aplicacion: metodoAplicacion,
            tipo_aplicacion: tipoAplicacion,
            intervalo_dias: parseInt(intervaloDias) || 1,
            repeticiones_totales: parseInt(repeticiones) || 1,
            tareaId: tarea?.id,
            notas: notas,
            productos: validProductos
        }

        mutation.mutate(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Método y Fecha */}
                {!tarea && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Configuración
                        </h3>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                            {/* Nombre del Tratamiento */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Tratamiento</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Tratamiento contra Oidio"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-slate-800 text-xs"
                                    />
                                </div>
                            </div>
                            {/* Tipo de Aplicación */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tipo de Aplicación</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'preventivo', label: 'Preventivo', icon: Check },
                                        { id: 'combativo', label: 'Combativo', icon: ShieldAlert },
                                    ].map((type) => {
                                        const Icon = type.icon
                                        const isSelected = tipoAplicacion === type.id
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => handleTipoChange(type.id as any)}
                                                className={cn(
                                                    "flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all font-bold text-xs",
                                                    isSelected
                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                        : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                                                )}
                                            >
                                                <Icon className={cn("w-4 h-4", isSelected ? "text-indigo-200" : "text-slate-400")} />
                                                {type.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Fecha */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="date"
                                            value={fechaAplicacion}
                                            onChange={(e) => setFechaAplicacion(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-slate-800 text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Intervalo */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Frecuencia (días)</label>
                                    <div className="relative">
                                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={intervaloDias}
                                            onChange={(e) => setIntervaloDias(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-slate-800 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Repeticiones */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Número de Repeticiones</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={repeticiones}
                                        onChange={(e) => setRepeticiones(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-slate-800 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Método de Aplicación */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Método de Aplicación</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'foliar', label: 'Foliar', icon: Bug },
                                        { id: 'riego', label: 'Riego', icon: Droplets },
                                        { id: 'otro', label: 'Otro', icon: MoreHorizontal },
                                    ].map((type) => {
                                        const Icon = type.icon
                                        const isSelected = metodoAplicacion === type.id
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setMetodoAplicacion(type.id as any)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-2xl border-2 transition-all font-bold text-[10px]",
                                                    isSelected
                                                        ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20"
                                                        : "bg-white border-slate-100 text-slate-500 hover:border-rose-200"
                                                )}
                                            >
                                                <Icon className={cn("w-4 h-4", isSelected ? "text-rose-200" : "text-slate-400")} />
                                                {type.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Columna Derecha: Notas */}
                <div className={cn("space-y-4", tarea ? "md:col-span-2" : "md:col-span-1")}>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <AlignLeft className="w-4 h-4" />
                        Notas y Observaciones
                    </h3>
                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 h-full">
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Describe el motivo de la aplicación o detalles específicos..."
                            className="w-full h-[180px] px-6 py-5 bg-white border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-900 shadow-inner resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Sección de Productos */}
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Productos Aplicados
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProductos.length === 0 ? (
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            className="md:col-span-2 p-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-center flex flex-col items-center justify-center bg-slate-50/50 hover:bg-rose-50/30 hover:border-rose-200 transition-all group antialiased"
                        >
                            <Bug className="w-10 h-10 text-slate-200 mb-3 group-hover:text-rose-200 transition-all duration-300" />
                            <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">No hay productos seleccionados.</p>
                            <span className="mt-3 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                Añadir producto
                            </span>
                        </button>
                    ) : (
                        selectedProductos.map((p, index) => (
                            <div key={index} className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-100 transition-all items-center">
                                    <div className="sm:col-span-6">
                                        <Select
                                            value={p.productoId}
                                            onChange={(e) => handleProductChange(index, 'productoId', parseInt(e.target.value))}
                                            icon={<ShoppingBag className="w-4 h-4" />}
                                        >
                                            <option value={0}>Seleccionar producto...</option>
                                            {filteredProductos.map((prod) => (
                                                <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="sm:col-span-3 relative">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={p.cantidad}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(',', '.')
                                                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                                    handleProductChange(index, 'cantidad', val)
                                                }
                                            }}
                                            placeholder="Cant."
                                            className="w-full px-2 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-800 text-sm text-center"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <Select
                                            variant="compact"
                                            value={p.unidad}
                                            onChange={(e) => handleProductChange(index, 'unidad', e.target.value)}
                                        >
                                            <option value="ml">ml</option>
                                            <option value="g">g</option>
                                        </Select>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(index)}
                                    className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-2xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {selectedProductos.length > 0 && (
                    <div className="flex justify-center pt-2">
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            className="text-[10px] font-black text-rose-600 uppercase flex items-center gap-2 hover:bg-rose-50 px-6 py-3 rounded-2xl border-2 border-dashed border-rose-100 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir otro producto
                        </button>
                    </div>
                )}
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title="No se pudo guardar el registro"
                        error={mutation.error}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-8 py-4 border border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                    CANCELAR
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-[2] px-8 py-4 bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {mutation.isPending ? 'PROCESANDO' : (initialData ? 'ACTUALIZAR' : 'GUARDAR')}
                    {!mutation.isPending && <Check className="w-5 h-5 text-rose-200" />}
                </button>
            </div>
        </form >
    )
}
