'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { registerNutricion, updateNutricion } from '@/lib/api/cultivos-service'
import { fetchProductos } from '@/lib/api/catalogos-service'
import { CreateNutricionDto, ProductoRiegoDto, NutricionSemanal } from '@/lib/types/api'
import { Plus, FlaskConical, Droplets, Calendar, AlignLeft, Activity, Hash, Trash2, Beaker, TrendingUp, Check, ShoppingBag } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { Select } from '@/components/ui'
import { useToast } from '@/providers/toast-provider'
import { cn } from '@/lib/utils'

interface CreateNutricionFormProps {
    cultivoId: number
    onSuccess: () => void
    onCancel: () => void
    initialData?: NutricionSemanal | null
}

// Helper component for numeric inputs that behave like text but only allow numbers/decimals
function NumericInput({
    value,
    onChange,
    placeholder,
    className,
    icon: Icon,
    iconColor = "text-slate-400",
    required = false,
    step = "any"
}: {
    value: string | number,
    onChange: (val: string) => void,
    placeholder?: string,
    className?: string,
    icon?: any,
    iconColor?: string,
    required?: boolean,
    step?: string
}) {
    return (
        <div className="relative">
            {Icon && <Icon className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", iconColor)} />}
            <input
                required={required}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={value}
                onChange={(e) => {
                    const val = e.target.value.replace(',', '.')
                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                        onChange(val)
                    }
                }}
                placeholder={placeholder}
                className={cn(
                    "w-full pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-800",
                    Icon ? "pl-12" : "px-4",
                    className
                )}
            />
        </div>
    )
}

export function CreateNutricionForm({ cultivoId, onSuccess, onCancel, initialData }: CreateNutricionFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data: productosCatalog = [] } = useQuery({
        queryKey: ['productos', 'activos'],
        queryFn: () => fetchProductos(true)
    })

    // Using strings for inputs to allow free typing (decimals, empty states)
    const [semana, setSemana] = useState(initialData?.semana?.toString() || '')
    const [tipoRiego, setTipoRiego] = useState<'nutricion' | 'solo_agua' | 'lavado_raices' | 'agua_esquejes'>(initialData?.tipo_riego || 'nutricion')
    const [fechaAplicacion, setFechaAplicacion] = useState(
        initialData?.fecha_aplicacion ? initialData.fecha_aplicacion.split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [litrosAgua, setLitrosAgua] = useState(initialData?.litros_agua?.toString() || '5')
    const [ph, setPh] = useState(initialData?.ph?.toString() || '6.0')
    const [ec, setEc] = useState(initialData?.ec?.toString() || '1.5')
    const [notas, setNotas] = useState(initialData?.notas || '')
    const [selectedProductos, setSelectedProductos] = useState<{ productoNutricionId: number, dosis_por_litro: string }[]>(
        initialData?.productos?.map(d => ({
            productoNutricionId: d.productoNutricionId,
            dosis_por_litro: d.dosis_por_litro.toString()
        })) || []
    )

    const mutation = useMutation({
        mutationFn: (data: CreateNutricionDto) => {
            if (initialData?.id) {
                return updateNutricion(initialData.id, cultivoId, data)
            }
            return registerNutricion(cultivoId, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivo', cultivoId] })
            queryClient.invalidateQueries({ queryKey: ['nutricion', cultivoId] })
            queryClient.invalidateQueries({ queryKey: ['timeline', cultivoId] })
            showToast(initialData ? '¡Registro actualizado!' : '¡Registro nutricional guardado!', 'success')
            onSuccess()
        },
        onError: () => {
            showToast(initialData ? 'Error al actualizar el registro' : 'Error al guardar el registro nutricional', 'error')
        }
    })

    const handleAddProduct = () => {
        setSelectedProductos([...selectedProductos, { productoNutricionId: 0, dosis_por_litro: '0' }])
    }

    const handleRemoveProduct = (index: number) => {
        setSelectedProductos(selectedProductos.filter((_, i) => i !== index))
    }

    const handleProductChange = (index: number, field: 'productoNutricionId' | 'dosis_por_litro', value: any) => {
        const newProductos = [...selectedProductos]
        newProductos[index] = { ...newProductos[index], [field]: value }
        setSelectedProductos(newProductos)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (tipoRiego === 'nutricion' && selectedProductos.length === 0) {
            showToast('Debes agregar al menos un producto para riego con nutrición', 'error')
            return
        }

        const payload: CreateNutricionDto = {
            semana: semana ? parseInt(semana) : undefined,
            faseHistorialId: initialData?.faseHistorialId,
            tipo_riego: tipoRiego,
            fecha_aplicacion: fechaAplicacion,
            litros_agua: parseFloat(litrosAgua) || 0,
            ph: ph ? parseFloat(ph) : undefined,
            ec: ec ? parseFloat(ec) : undefined,
            notas: notas,
            productos: selectedProductos
                .filter(p => p.productoNutricionId > 0 && parseFloat(p.dosis_por_litro) > 0)
                .map(p => ({
                    productoNutricionId: p.productoNutricionId,
                    dosis_por_litro: parseFloat(p.dosis_por_litro)
                }))
        }

        mutation.mutate(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: General */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        General
                    </h3>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                        {/* Tipo de Riego */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tipo de Riego</label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'nutricion', label: 'Nutrición (Fertilizantes)', icon: FlaskConical },
                                    { id: 'solo_agua', label: 'Solo Agua', icon: Droplets },
                                    { id: 'agua_esquejes', label: 'Agua Esquejes', icon: TrendingUp },
                                    { id: 'lavado_raices', label: 'Lavado de Raíces', icon: Activity },
                                ].map((type) => {
                                    const Icon = type.icon
                                    const isSelected = tipoRiego === type.id
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setTipoRiego(type.id as any)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm text-left",
                                                isSelected
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-sky-200"
                                            )}
                                        >
                                            <Icon className={cn("w-5 h-5", isSelected ? "text-sky-200" : "text-slate-400")} />
                                            {type.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Fecha */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha de Aplicación</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="date"
                                    value={fechaAplicacion}
                                    onChange={(e) => setFechaAplicacion(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold text-slate-800"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Parámetros */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Beaker className="w-4 h-4" />
                        Parámetros Físico-Químicos
                    </h3>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Litros */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Litros de Agua</label>
                                <NumericInput
                                    required
                                    value={litrosAgua}
                                    onChange={setLitrosAgua}
                                    icon={Droplets}
                                    iconColor="text-sky-400"
                                    placeholder="0"
                                />
                            </div>

                            {/* Semana */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Semana (Opcional)</label>
                                <NumericInput
                                    value={semana}
                                    onChange={setSemana}
                                    icon={Hash}
                                    placeholder="Auto"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* pH */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nivel pH</label>
                                <NumericInput
                                    value={ph}
                                    onChange={setPh}
                                    icon={Activity}
                                    iconColor="text-rose-400"
                                    placeholder="0.0"
                                />
                            </div>

                            {/* EC */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">EC (mS/cm)</label>
                                <NumericInput
                                    value={ec}
                                    onChange={setEc}
                                    icon={TrendingUp}
                                    iconColor="text-amber-500"
                                    placeholder="0.0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Productos */}
            {(tipoRiego === 'nutricion' || tipoRiego === 'agua_esquejes') && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Beaker className="w-4 h-4" />
                            Mezcla de Productos
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProductos.length === 0 ? (
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="md:col-span-2 p-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-center flex flex-col items-center justify-center bg-slate-50/50 hover:bg-sky-50/30 hover:border-sky-200 transition-all group antialiased"
                            >
                                <FlaskConical className="w-10 h-10 text-slate-200 mb-3 group-hover:text-sky-200 transition-all duration-300" />
                                <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">No hay productos en la mezcla.</p>
                                <span className="mt-3 text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-4 py-1.5 rounded-full border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-all">
                                    Añadir producto
                                </span>
                            </button>
                        ) : (
                            selectedProductos.map((p, index) => (
                                <div key={index} className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-100 transition-all items-center">
                                        <div className="sm:col-span-8">
                                            <Select
                                                value={p.productoNutricionId}
                                                onChange={(e) => handleProductChange(index, 'productoNutricionId', parseInt(e.target.value))}
                                                icon={<ShoppingBag className="w-4 h-4" />}
                                            >
                                                <option value={0}>Producto...</option>
                                                {productosCatalog.map((prod) => (
                                                    <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className="sm:col-span-4 relative">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={p.dosis_por_litro}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(',', '.')
                                                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                                        handleProductChange(index, 'dosis_por_litro', val)
                                                    }
                                                }}
                                                placeholder="Dosis"
                                                className="w-full pl-3 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-800 text-sm"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">ml/L</span>
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
                                className="text-[10px] font-black text-sky-600 uppercase flex items-center gap-2 hover:bg-sky-50 px-6 py-3 rounded-2xl border-2 border-dashed border-sky-100 transition-all active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir otro producto
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Notas */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" />
                    Observaciones Adicionales
                </label>
                <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Escribe aquí cualquier observación relevante sobre este riego..."
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium min-h-[120px] text-slate-900 shadow-inner"
                />
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
                    className="flex-[2] px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {mutation.isPending ? 'PROCESANDO' : (initialData ? 'ACTUALIZAR' : 'GUARDAR')}
                    {!mutation.isPending && <Check className="w-5 h-5 text-sky-400" />}
                </button>
            </div>
        </form>
    )
}
