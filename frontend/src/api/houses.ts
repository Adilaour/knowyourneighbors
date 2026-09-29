import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { House, HouseInput } from './types'

export const HOUSES_KEY = ['houses']

export function useHouses() {
  return useQuery({ queryKey: HOUSES_KEY, queryFn: () => api.get<House[]>('/houses') })
}

export function useHouse(id: number | undefined) {
  return useQuery({
    queryKey: [...HOUSES_KEY, id],
    queryFn: () => api.get<House>(`/houses/${id}`),
    enabled: id !== undefined,
  })
}

export function useCreateHouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HouseInput) => api.post<House>('/houses', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOUSES_KEY }),
  })
}

export function useUpdateHouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: HouseInput }) =>
      api.put<House>(`/houses/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOUSES_KEY }),
  })
}

export function useDeleteHouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/houses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOUSES_KEY }),
  })
}
