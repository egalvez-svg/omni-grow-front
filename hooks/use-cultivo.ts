import { useQuery } from '@tanstack/react-query'
import {
    fetchCultivoById,
    fetchNutricionHistorial,
    fetchControlPlagasHistorial,
    fetchCultivoTimeline,
    fetchTareasPendientes,
    fetchResumenControlPlagas
} from '@/lib/api/cultivos-service'

export function useCultivo(cultivoId: number) {
    const { data: cultivo, isLoading: cultivoLoading, error: cultivoError, refetch: refetchCultivo } = useQuery({
        queryKey: ['cultivo', cultivoId],
        queryFn: () => fetchCultivoById(cultivoId),
        enabled: !!cultivoId
    })

    const { data: historialNutricion = [], isLoading: nutricionLoading } = useQuery({
        queryKey: ['nutricion', cultivoId],
        queryFn: () => fetchNutricionHistorial(cultivoId),
        enabled: !!cultivoId
    })

    const { data: historialControlPlagas = [], isLoading: plagasLoading } = useQuery({
        queryKey: ['control-plagas', cultivoId],
        queryFn: () => fetchControlPlagasHistorial(cultivoId),
        enabled: !!cultivoId
    })

    const { data: timeline = [], isLoading: timelineLoading } = useQuery({
        queryKey: ['timeline', cultivoId],
        queryFn: () => fetchCultivoTimeline(cultivoId),
        enabled: !!cultivoId
    })

    const { data: tareasPendientes = [], isLoading: tareasLoading } = useQuery({
        queryKey: ['tareas-pendientes', cultivoId],
        queryFn: () => fetchTareasPendientes(cultivoId),
        enabled: !!cultivoId
    })

    const { data: resumenPlagas, isLoading: resumenLoading } = useQuery({
        queryKey: ['resumen-plagas', cultivoId],
        queryFn: () => fetchResumenControlPlagas(cultivoId),
        enabled: !!cultivoId
    })

    return {
        cultivo,
        historialNutricion,
        historialControlPlagas,
        timeline,
        tareasPendientes,
        resumenPlagas,
        isLoading: cultivoLoading || nutricionLoading || plagasLoading || timelineLoading || tareasLoading || resumenLoading,
        error: cultivoError,
        refetchCultivo
    }
}
