'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { cambiarFase } from '@/lib/api/cultivos-service'
import { fetchFases } from '@/lib/api/catalogos-service'
import { fetchUserSalas } from '@/lib/api/salas-service'
import { fetchCamasBySala } from '@/lib/api/camas-service'
import { fetchMediosCultivo } from '@/lib/api/medio-cultivo-service'
import { CreateTransicionFaseDto, Fase, Cultivo } from '@/lib/types/api'
import { Activity, Check, AlertCircle, FileText, MapPin, Layers, Droplets } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { Select } from '@/components/ui'
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-2.5 border border-amber-100 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <p className="text-[11px] font-black text-amber-800 leading-tight">Transición de Etapa</p>
                    <p className="text-[10px] text-amber-600 leading-normal mt-0.5">
                        Registra este momento en el historial. Asegúrate de ajustar las condiciones ambientales.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Nueva Etapa */}
                <div className="col-span-2">
                    <Select
                        label="Nueva Etapa"
                        required
                        icon={<Activity className="w-3.5 h-3.5" />}
                        value={formData.nuevaFaseId}
                        onChange={(e) => setFormData({ ...formData, nuevaFaseId: parseInt(e.target.value) })}
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
                    </Select>
                </div>

                {/* Sala */}
                <Select
                    label="Sala"
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    value={formData.salaId || ''}
                    onChange={(e) => setFormData({ ...formData, salaId: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                    <option value="">Opcional</option>
                    {salas?.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                </Select>

                {/* Cama */}
                <Select
                    label="Cama"
                    icon={<Layers className="w-3.5 h-3.5" />}
                    value={formData.camaId || ''}
                    disabled={!formData.salaId || loadingCamas}
                    onChange={(e) => setFormData({ ...formData, camaId: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                    <option value="">{loadingCamas ? '...' : 'Opcional'}</option>
                    {camas?.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </Select>

                {/* Medio de Cultivo */}
                <div className="col-span-2">
                    <Select
                        label="Medio de Cultivo"
                        icon={<Droplets className="w-3.5 h-3.5" />}
                        value={formData.medioCultivoId || ''}
                        onChange={(e) => setFormData({ ...formData, medioCultivoId: e.target.value ? parseInt(e.target.value) : undefined })}
                    >
                        <option value="">Opcional</option>
                        {medios?.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </Select>
                </div>

                {/* Notas */}
                <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        Notas (Opcional)
                    </label>
                    <textarea
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        placeholder="Observaciones de la transición..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-sm min-h-[60px] text-slate-900"
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

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                >
                    CANCELAR
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending || formData.nuevaFaseId === 0}
                    className="flex-[2] px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                    {mutation.isPending ? 'PROCESANDO' : 'GUARDAR'}
                    {!mutation.isPending && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
            </div>
        </form>
    )
}
