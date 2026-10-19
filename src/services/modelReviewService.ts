import { apiClient } from './apiClient';

export interface ModelVersion {
  id: string;
  scanId?: string;
  orderId?: string;
  versionNumber: number;
  modelUrl?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  approvalNotes?: string;
  revisionReason?: string;
  createdAt: string;
}

export const modelReviewService = {
  getVersionsForScan: async (scanId: string): Promise<ModelVersion[]> => {
    const res = await apiClient.get<ModelVersion[]>(`/models/${scanId}/versions`);
    return res.data;
  },

  approveVersion: async (versionId: string, notes?: string): Promise<ModelVersion> => {
    const res = await apiClient.post<ModelVersion>(`/models/versions/${versionId}/approve`, { notes });
    return res.data;
  },

  requestRevision: async (versionId: string, reason: string, notes?: string): Promise<ModelVersion> => {
    const res = await apiClient.post<ModelVersion>(`/models/versions/${versionId}/request-revision`, {
      reason,
      notes,
    });
    return res.data;
  },
};
