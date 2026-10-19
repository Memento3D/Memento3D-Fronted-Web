import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseApi } from '../api/warehouseApi';
import type { CreateWarehousePayload, UpdateWarehousePayload, WarehouseListParams } from '../types/warehouse.types';

export const useWarehouses = (params?: WarehouseListParams) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => warehouseApi.list(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useWarehouseMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateWarehousePayload) => warehouseApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses-select'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWarehousePayload }) =>
      warehouseApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses-select'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => warehouseApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses-select'] });
    },
  });

  return { createMutation, updateMutation, deactivateMutation };
};
