import React, { createContext, useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '../api/warehouseApi';
import type { Warehouse } from '../types/warehouse.types';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import { useAuth } from '../../auth/hooks/useAuth';

interface WarehouseContextValue {
  activeWarehouseId: string | null;
  activeWarehouse: Warehouse | null;
  myWarehouses: Warehouse[];
  setActiveWarehouseId: (id: string) => void;
  isLoading: boolean;
  hasAccess: boolean;
  refetchWarehouses: () => void;
}

const WarehouseContext = createContext<WarehouseContextValue | undefined>(undefined);

const STORAGE_KEY = 'memento3d_active_warehouse_id';

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [storedId, setStoredId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const canAccessWarehouses =
    Boolean(isAuthenticated && user?.role && ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE'].includes(user.role));

  const { data: myWarehouses = [], isLoading, refetch } = useQuery({
    queryKey: ['my-warehouses'],
    queryFn: async () => {
      try {
        const res = await warehouseApi.getMyWarehouses();
        if (res && res.length > 0) return res;
        const fallback = await warehouseApi.list({ limit: 50 });
        return fallback.content || [];
      } catch (err) {
        return [];
      }
    },
    enabled: Boolean(tokenStorage.getAccessToken() && canAccessWarehouses),
    staleTime: 60000,
  });

  // Derive active warehouse ID: prioritize user stored ID if valid, else fallback to 1st accessible warehouse
  const activeWarehouseId = useMemo(() => {
    if (myWarehouses.length === 0) return null;
    if (storedId && myWarehouses.some((w) => w.id === storedId)) {
      return storedId;
    }
    return myWarehouses[0]?.id || null;
  }, [storedId, myWarehouses]);

  const setActiveWarehouseId = (id: string) => {
    setStoredId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const activeWarehouse = useMemo(() => {
    if (!activeWarehouseId) return null;
    return myWarehouses.find((w) => w.id === activeWarehouseId) || null;
  }, [activeWarehouseId, myWarehouses]);

  const hasAccess = isLoading || myWarehouses.length > 0;

  return (
    <WarehouseContext.Provider
      value={{
        activeWarehouseId,
        activeWarehouse,
        myWarehouses,
        setActiveWarehouseId,
        isLoading,
        hasAccess,
        refetchWarehouses: refetch,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouseContext = (): WarehouseContextValue => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouseContext must be used within a WarehouseProvider');
  }
  return context;
};
