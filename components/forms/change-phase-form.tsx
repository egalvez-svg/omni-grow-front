'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { cambiarFase } from '@/lib/api/cultivos-service'
import { fetchFases } from '@/lib/api/catalogos-service'
import { fetchUserSalas } from '@/lib/api/salas-service'
import { fetchCamasBySala } from '@/lib/api/camas-service'
import { fetchMediosCultivo } from '@/lib/api/medio-cultivo-service'
import { CreateTransicionFaseDto, Fase, Cultivo } from '@/lib/types/api'
import { Activity, Save, AlertCircle, FileText, MapPin, Layers, Droplets } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'

interface ChangePhaseFormProps {
    cultivo: Cultivo
    onSuccess: () => void
    onCancel: () => void
}

export function ChangePhaseForm({ cultivo, onSuccess, onCancel }: ChangePhaseFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const [formData, setFormData] = useState<CreateTransicionFaseDto>({
        nuevaFaseId: 0,
        notas: '',
        salaId: cultivo.salaId,
        camaId: cultivo.camaId,
        medioCultivoId: cultivo.medioCultivoId
    })

    const { data: fases } = useQuery({
        queryKey: ['fases'],
        queryFn: fetchFases
    })

    const { data: salas } = useQuery({
        queryKey: ['salas'],
        queryFn: fetchUserSalas
    })

    const { data: medios } = useQuery({
        queryKey: ['medios-cultivo'],
        queryFn: fetchMediosCultivo
    })

    const { data: camas, isLoading: loadingCamas } = useQuery({
        queryKey: ['camas', formData.salaId],
        queryFn: () => formData.salaId ? fetchCamasBySala(formData.salaId) : Promise.resolve([]),
        enabled: !!formData.salaId
    })

    useEffect(() => {
        if (camas && formData.camaId) {
            const currentCamaExists = camas.some(c => c.id === formData.camaId)
            if (!currentCamaExists) {
                setFormData(prev => ({ ...prev, camaId: undefined }))
            }
        }
    }, [camas, formData.salaId, formData.camaId])

    const mutation = useMutation({
        mutationFn: (data: CreateTransicionFaseDto) => cambiarFase(cultivo.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivo', cultivo.id] })
            showToast('Etapa actualizada correctamente', 'success')
            onSuccess()
        },
        onError: () => {
            showToast('Error al cambiar la etapa', 'error')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.nuevaFaseId === 0) {
            showToast('Seleccionar nueva etapa', 'error')
            return
        }
        if (formData.nuevaFaseId === cultivo.faseActual?.id) {
            showToast('La nueva etapa debe ser diferente a la actual', 'error')
            return
        }
        mutation.mutate(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-amber-800">Transición de Etapa</p>
                    <p className="text-xs text-amber-600">
                        Cambiar la etapa registrará este momento en el historial del ciclo. Asegúrate de que las condiciones ambientales sean las adecuadas para la nueva etapa.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nueva Etapa */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Nueva Etapa <span className="text-rose-500">*</span>
                    </label>
                    <select
                        required
                        value={formData.nuevaFaseId}
                        onChange={(e) => setFormData({ ...formData, nuevaFaseId: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                    >
                        <option value={0}>Seleccionar nueva etapa...</option>
                        {fases?.map(f => (
                            <option
                                key={f.id}
                                value={f.id}
                                disabled={f.id === cultivo.faseActual?.id}
                            >
                                {f.nombre} {f.id === cultivo.faseActual?.id ? '(Actual)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sala */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-sky-500" />
                        Sala (Opcional)
                    </label>
                    <select
                        value={formData.salaId || ''}
                        onChange={(e) => setFormData({ ...formData, salaId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    >
                        <option value="">Seleccionar sala...</option>
                        {salas?.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Cama */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-sky-500" />
                        Cama (Opcional)
                    </label>
                    <select
                        value={formData.camaId || ''}
                        disabled={!formData.salaId || loadingCamas}
                        onChange={(e) => setFormData({ ...formData, camaId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900 disabled:opacity-50"
                    >
                        <option value="">{loadingCamas ? 'Cargando camas...' : 'Seleccionar cama...'}</option>
                        {camas?.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre} (Cap: {c.capacidad_plantas})</option>
                        ))}
                    </select>
                </div>

                {/* Medio de Cultivo */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-emerald-500" />
                        Medio de Cultivo (Opcional)
                    </label>
                    <select
                        value={formData.medioCultivoId || ''}
                        onChange={(e) => setFormData({ ...formData, medioCultivoId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                    >
                        <option value="">Seleccionar medio...</option>
                        {medios?.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Notas */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Notas de la Transición (Opcional)
                    </label>
                    <textarea
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        placeholder="Ej: Se observa buen vigor, iniciando ciclo de luz 12/12..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[100px] text-slate-900"
                    />
                </div>
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title="No se pudo procesar la transición"
                        error={mutation.error}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending || formData.nuevaFaseId === 0}
                    className="flex-[2] px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {mutation.isPending ? 'Procesando...' : 'Confirmar Cambio de Etapa'}
                    {!mutation.isPending && <Save className="w-5 h-5" />}
                </button>
            </div>
        </form>
    )
}
