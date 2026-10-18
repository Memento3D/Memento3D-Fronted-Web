export type WarehouseStatus = 'ACTIVE' | 'INACTIVE';

export type WarehouseRole = 'MANAGER' | 'WAREHOUSE_STAFF' | 'PRINT_OPERATOR';

export type MembershipStatus = 'ACTIVE' | 'REVOKED';

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

export interface WarehouseListParams {
  search?: string;
  status?: WarehouseStatus;
  page?: number;
  limit?: number;
}

export interface WarehouseMember {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  role: WarehouseRole;
  status: MembershipStatus;
  assignedBy?: string;
  assignedAt: string;
  revokedAt?: string;
}

export interface AssignMemberPayload {
  userId?: string;
  email?: string;
  role: WarehouseRole;
}
