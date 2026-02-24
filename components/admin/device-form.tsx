'use client'

import { useState, useEffect } from 'react'
import type { CreateDispositivoDto, UpdateDispositivoDto, User } from '@/lib/types/api'
import { Check, Plus, User as UserIcon } from 'lucide-react'
import { Select } from '@/components/ui'

interface DeviceFormProps {
    initialData?: UpdateDispositivoDto & { id?: number }
    users: User[]
    onSubmit: (data: CreateDispositivoDto | UpdateDispositivoDto) => void
    onCancel: () => void
    isLoading?: boolean
}

export function DeviceForm({ initialData, users, onSubmit, onCancel, isLoading }: DeviceFormProps) {
    const [formData, setFormData] = useState<CreateDispositivoDto>({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        ubicacion: initialData?.ubicacion || '',
        ip: initialData?.ip || '',
        usuarioId: initialData?.usuarioId || undefined,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        } else if (formData.nombre.length > 100) {
            newErrors.nombre = 'El nombre no puede exceder 100 caracteres'
        }

        if (formData.ubicacion && formData.ubicacion.length > 150) {
            newErrors.ubicacion = 'La ubicación no puede exceder 150 caracteres'
        }

        if (formData.ip) {
            const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
            if (!ipRegex.test(formData.ip)) {
                newErrors.ip = 'Debe ser una dirección IPv4 válida'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            onSubmit(formData)
        }
    }

    const handleChange = (field: keyof CreateDispositivoDto, value: string | number | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Ej: Dispositivo Sala"
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                </label>
                <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción del dispositivo"
                />
            </div>

            {/* Ubicación */}
            <div>
                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                </label>
                <input
                    type="text"
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleChange('ubicacion', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ubicacion ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Ej: Sala de estar"
                />
                {errors.ubicacion && <p className="mt-1 text-sm text-red-500">{errors.ubicacion}</p>}
            </div>

            {/* IP */}
            <div>
                <label htmlFor="ip" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección IP
                </label>
                <input
                    type="text"
                    id="ip"
                    value={formData.ip}
                    onChange={(e) => handleChange('ip', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ip ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="192.168.1.100"
                />
                {errors.ip && <p className="mt-1 text-sm text-red-500">{errors.ip}</p>}
            </div>

            {/* Usuario */}
            <Select
                label="Usuario Propietario"
                icon={<UserIcon className="w-4 h-4" />}
                value={formData.usuarioId || ''}
                onChange={(e) => handleChange('usuarioId', e.target.value ? Number(e.target.value) : undefined)}
            >
                <option value="">Seleccionar usuario...</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.nombre} {user.apellido_paterno} - {user.email}
                    </option>
                ))}
            </Select>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-6 py-3 border border-slate-200 rounded-xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                    CANCELAR
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {isLoading ? 'PROCESANDO' : (initialData?.id ? 'ACTUALIZAR' : 'GUARDAR')}
                    {!isLoading && (initialData?.id ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </button>
            </div>
        </form>
    )
}
