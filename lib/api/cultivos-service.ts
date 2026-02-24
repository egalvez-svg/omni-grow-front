import apiClient from '@/lib/api/client'
import type {
    Cultivo,
    CreateCultivoDto,
    Planta,
    CreatePlantaDto,
    NutricionSemanal,
    CreateNutricionDto,
    CreateTransicionFaseDto,
    HistorialFase,
    ControlPlaga,
    CreateControlPlagaDto,
    TimelineEvent
} from '@/lib/types/api'

export async function fetchAllCultivos(): Promise<Cultivo[]> {
    const response = await apiClient.get<Cultivo[]>('/cultivos')
    return response.data
}

export async function fetchActiveCultivos(): Promise<Cultivo[]> {
    const response = await apiClient.get<Cultivo[]>('/cultivos/activos')
    return response.data
}

export async function fetchCultivosBySala(salaId: number): Promise<Cultivo[]> {
    const response = await apiClient.get<Cultivo[]>(`/cultivos/sala/${salaId}`)
    return response.data
}

export async function fetchCultivoById(id: number): Promise<Cultivo> {
    const response = await apiClient.get<Cultivo>(`/cultivos/${id}`)
    return response.data
}

export async function createCultivo(data: CreateCultivoDto): Promise<Cultivo> {
    const response = await apiClient.post<Cultivo>('/cultivos', data)
    return response.data
}

export async function updateCultivo(id: number, data: Partial<CreateCultivoDto>): Promise<Cultivo> {
    const response = await apiClient.patch<Cultivo>(`/cultivos/${id}`, data)
    return response.data
}

export async function cambiarFase(id: number, data: CreateTransicionFaseDto): Promise<HistorialFase> {
    const response = await apiClient.post<HistorialFase>(`/cultivos/${id}/transicion`, data)
    return response.data
}

export async function deleteCultivo(id: number): Promise<void> {
    await apiClient.delete(`/cultivos/${id}`)
}

// Plantas within Crop
export async function addPlantaToCultivo(cultivoId: number, data: CreatePlantaDto): Promise<Planta> {
    const response = await apiClient.post<Planta>(`/plantas/cultivo/${cultivoId}`, data)
    return response.data
}

export async function fetchPlantasByCultivo(cultivoId: number): Promise<Planta[]> {
    const response = await apiClient.get<Planta[]>(`/plantas/cultivo/${cultivoId}`)
    return response.data
}

export async function fetchPlantaById(id: number): Promise<Planta> {
    const response = await apiClient.get<Planta>(`/plantas/${id}`)
    return response.data
}

export async function updatePlanta(id: number, data: Partial<CreatePlantaDto>): Promise<Planta> {
    const response = await apiClient.patch<Planta>(`/plantas/${id}`, data)
    return response.data
}

export async function deletePlanta(id: number): Promise<void> {
    await apiClient.delete(`/plantas/${id}`)
}

// Nutricion within Crop
export async function registerNutricion(cultivoId: number, data: CreateNutricionDto): Promise<NutricionSemanal> {
    const response = await apiClient.post<NutricionSemanal>(`/nutricion/cultivo/${cultivoId}`, data)
    return response.data
}

export async function fetchNutricionHistorial(cultivoId: number): Promise<NutricionSemanal[]> {
    const response = await apiClient.get<NutricionSemanal[]>(`/nutricion/cultivo/${cultivoId}`)
    return response.data
}

export async function updateNutricion(id: number, cultivoId: number, data: Partial<CreateNutricionDto>): Promise<NutricionSemanal> {
    const response = await apiClient.patch<NutricionSemanal>(`/nutricion/${id}/cultivo/${cultivoId}`, data)
    return response.data
}

export async function deleteNutricion(id: number, cultivoId: number): Promise<void> {
    await apiClient.delete(`/nutricion/${id}/cultivo/${cultivoId}`)
}

// Control de Plagas
export async function fetchControlPlagasHistorial(cultivoId: number): Promise<ControlPlaga[]> {
    const response = await apiClient.get<ControlPlaga[]>('/control-plagas', {
        params: { cultivoId }
    })
    return response.data
}

export async function registerControlPlaga(data: CreateControlPlagaDto): Promise<ControlPlaga> {
    const response = await apiClient.post<ControlPlaga>('/control-plagas', data)
    return response.data
}

export async function updateControlPlaga(id: number, data: Partial<CreateControlPlagaDto>): Promise<ControlPlaga> {
    const response = await apiClient.patch<ControlPlaga>(`/control-plagas/${id}`, data)
    return response.data
}

export async function deleteControlPlaga(id: number): Promise<void> {
    await apiClient.delete(`/control-plagas/${id}`)
}

// Timeline
export async function fetchCultivoTimeline(id: number): Promise<TimelineEvent[]> {
    const response = await apiClient.get<TimelineEvent[]>(`/cultivos/${id}/timeline`)
    return response.data
}
