import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '../api/materialApi';
import type { CreateMaterialPayload, UpdateMaterialPayload, MaterialListParams } from '../types/material.types';

export const useMaterials = (params?: MaterialListParams) => {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => materialApi.list(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMaterialDetails = (id?: string) => {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => (id ? materialApi.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMaterialMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateMaterialPayload) => materialApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMaterialPayload }) =>
      materialApi.update(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', vars.id] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => materialApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  return { createMutation, updateMutation, deactivateMutation };
};
