export type WarehouseStatus = 'ACTIVE' | 'INACTIVE';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  status: WarehouseStatus;
  createdBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehousePayload {
  code: string;
  name: string;
  location?: string;
}

export interface UpdateWarehousePayload {
  code?: string;
  name?: string;
  location?: string;
  status?: WarehouseStatus;
}
