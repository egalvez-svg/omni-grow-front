'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { cambiarFase } from '@/lib/api/cultivos-service'
import { fetchFases } from '@/lib/api/catalogos-service'
import { CreateTransicionFaseDto, Fase } from '@/lib/types/api'
import { Activity, Save, AlertCircle, FileText } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'
import { cn } from '@/lib/utils'

interface ChangePhaseFormProps {
    cultivoId: number
    currentPhaseId?: number
    onSuccess: () => void
    onCancel: () => void
}

export function ChangePhaseForm({ cultivoId, currentPhaseId, onSuccess, onCancel }: ChangePhaseFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const [formData, setFormData] = useState<CreateTransicionFaseDto>({
        nuevaFaseId: 0,
        notas: ''
    })

    const { data: fases } = useQuery({
        queryKey: ['fases'],
        queryFn: fetchFases
    })

    const mutation = useMutation({
        mutationFn: (data: CreateTransicionFaseDto) => cambiarFase(cultivoId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivo', cultivoId] })
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
        if (formData.nuevaFaseId === currentPhaseId) {
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

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Nueva Etapa
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
                                disabled={f.id === currentPhaseId}
                            >
                                {f.nombre} {f.id === currentPhaseId ? '(Actual)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
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
