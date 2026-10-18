export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'RESIN' | 'TPU' | 'NYLON' | 'OTHER';
export type MaterialStatus = 'ACTIVE' | 'INACTIVE';

export interface Material {
  id: string;
  sku: string;
  name: string;
  materialType: MaterialType;
  color: string;
  colorHex?: string;
  density?: number;
  diameter?: number;
  printTempMin?: number;
  printTempMax?: number;
  bedTempMin?: number;
  bedTempMax?: number;
  unitCost: number;
  status: MaterialStatus;
  description?: string;
  createdBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialPayload {
  sku: string;
  name: string;
  materialType: MaterialType;
  color: string;
  colorHex?: string;
  density?: number;
  diameter?: number;
  printTempMin?: number;
  printTempMax?: number;
  bedTempMin?: number;
  bedTempMax?: number;
  unitCost: number;
  description?: string;
}

export interface UpdateMaterialPayload {
  sku?: string;
  name?: string;
  materialType?: MaterialType;
  color?: string;
  colorHex?: string;
  density?: number;
  diameter?: number;
  printTempMin?: number;
  printTempMax?: number;
  bedTempMin?: number;
  bedTempMax?: number;
  unitCost?: number;
  status?: MaterialStatus;
  description?: string;
}

export interface MaterialListParams {
  status?: MaterialStatus;
  type?: MaterialType;
  search?: string;
  page?: number;
  limit?: number;
}
