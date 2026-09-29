import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { Person, PersonInput } from './types'

export const PEOPLE_KEY = ['people']

export function usePeople() {
  return useQuery({ queryKey: PEOPLE_KEY, queryFn: () => api.get<Person[]>('/people') })
}

export function usePerson(id: number | undefined) {
  return useQuery({
    queryKey: [...PEOPLE_KEY, id],
    queryFn: () => api.get<Person>(`/people/${id}`),
    enabled: id !== undefined,
  })
}

export function useCreatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PersonInput) => api.post<Person>('/people', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PEOPLE_KEY }),
  })
}

export function useUpdatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PersonInput }) =>
      api.put<Person>(`/people/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PEOPLE_KEY }),
  })
}

export function useDeletePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/people/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PEOPLE_KEY }),
  })
}

export function useUploadPersonPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData()
      formData.append('photo', file)
      return api.upload<Person>(`/people/${id}/photo`, formData)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PEOPLE_KEY }),
  })
}

export function useDeletePersonPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<Person>(`/people/${id}/photo`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PEOPLE_KEY }),
  })
}
