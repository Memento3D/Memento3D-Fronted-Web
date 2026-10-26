import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { materialApi } from '../api/materialApi';
import type { CreateMaterialPayload, UpdateMaterialPayload, MaterialListParams } from '../types/material.types';
import { queryKeys } from '../../../lib/query/queryKeys';

export const useMaterials = (params?: MaterialListParams) => {
  return useQuery({
    queryKey: queryKeys.materials.list(params),
    queryFn: ({ signal }) => materialApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
};

export const useMaterialDetails = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.materials.detail(id || ''),
    queryFn: () => (id ? materialApi.getById(id) : null),
    enabled: !!id,
  });
};

export const useMaterialMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateMaterialPayload) => materialApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMaterialPayload }) =>
      materialApi.update(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.detail(vars.id) });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => materialApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
    },
  });

  return { createMutation, updateMutation, deactivateMutation };
};
