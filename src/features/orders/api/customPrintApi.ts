import { apiClient } from '../../../services/apiClient';
export interface CustomPrintDesign {
  id: string;orderId: string;orderItemId: string;modelOutputId: string;fitResultId: string;revision: number;
  status: 'QUEUED' | 'EXPORTING' | 'READY' | 'APPROVED' | 'REJECTED' | 'FAILED';
  requestedHeightCm: number;selection: Record<string, string | null>;
  assets: Array<{assetVersionId: string;name: string;slot: string}>;
  snapshotSha256: string;artifactSha256: string | null;artifactSizeBytes: number | null;
  downloadUrl: string | null;modelVersionId: string | null;approvedForProduction: boolean;readyForMachine: boolean;
  errorCode: string | null;reviewNotes: string | null;
}
const path = (orderId: string) => `/orders/${encodeURIComponent(orderId)}/custom-design`;
export const customPrintApi = {
  async get(orderId: string) {return (await apiClient.get<CustomPrintDesign>(path(orderId), { timeout: 30000 })).data;},
  async retry(orderId: string) {return (await apiClient.post<CustomPrintDesign>(`${path(orderId)}/retry`)).data;},
  async review(orderId: string, approved: boolean, notes: string) {
    return (await apiClient.post<CustomPrintDesign>(`${path(orderId)}/review`, { approved, notes, manufacturingChecked: true })).data;
  },
};
