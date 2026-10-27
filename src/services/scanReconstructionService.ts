import { apiClient } from './apiClient';

export interface ReconstructionCapabilities {
  provider: string;
  minImages: number;
  maxImages: number;
  supportedFormats: string[];
  maxFileSizeMb: number;
  guidelines: string;
}

export interface ScanSession {
  id: string;
  name: string;
  status: string;
  inputMode: string;
  imageCount: number;
  createdAt: string;
}

export interface ScanImageItem {
  id: string;
  scanId: string;
  fileName: string;
  fileSizeBytes: number;
  uploadStatus: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  fullUrl?: string;
  isPrimary?: boolean;
  createdAt: string;
}

export interface ReconstructionJobItem {
  jobId: string;
  scanId: string;
  status: 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
  stage: string;
  message?: string;
  progressPercent?: number;
  modelUrl?: string;
  previewUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ModelOutputItem {
  id: string;
  jobId: string;
  fileFormat: string;
  outputUrl: string;
  fileSizeBytes: number;
  isPrimary: boolean;
  storageProvider?: string;
}

export const scanReconstructionService = {
  getCapabilities: async (): Promise<ReconstructionCapabilities> => {
    try {
      const res = await apiClient.get<ReconstructionCapabilities>('/reconstruction/capabilities');
      return res.data;
    } catch {
      // Graceful fallback defaults if server capability endpoint not reachable
      return {
        provider: 'AI_3D_GAUSSIAN',
        minImages: 10,
        maxImages: 50,
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSizeMb: 20,
        guidelines: 'Chụp 10-30 góc ảnh rõ nét, bao quát 360 độ quanh vật thể trong điều kiện ánh sáng tự nhiên đầy đủ.',
      };
    }
  },

  createScan: async (name: string, inputMode = 'IMAGE_SET'): Promise<ScanSession> => {
    const res = await apiClient.post<ScanSession>('/scans', {
      name: name.trim(),
      input_mode: inputMode,
    });
    return res.data;
  },

  uploadImage: async (scanId: string, file: File): Promise<ScanImageItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ScanImageItem>(`/scans/${scanId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getScanImages: async (scanId: string, page = 1, limit = 100): Promise<{ images: ScanImageItem[]; total: number }> => {
    const res = await apiClient.get<any>(`/scans/${scanId}/images`, {
      params: { page, limit },
    });
    const items = res.data?.images || res.data?.content || [];
    return {
      images: items,
      total: res.data?.total || items.length,
    };
  },

  deleteScanImage: async (scanId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/scans/${scanId}/images/${imageId}`);
  },

  submitJob: async (scanId: string, inputImageId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.post<any>(`/scans/${scanId}/reconstruction-jobs`, {
      input_image_id: inputImageId,
      tier: 'PREVIEW',
    });
    return {
      jobId: res.data.jobId || res.data.id,
      scanId: res.data.scanId || scanId,
      status: res.data.status?.toLowerCase() || 'queued',
      stage: res.data.stage || 'queued',
      message: res.data.message,
      progressPercent: res.data.progressPercent ?? 0,
      modelUrl: res.data.modelUrl,
      createdAt: res.data.createdAt,
    };
  },

  getJobById: async (jobId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.get<any>(`/reconstruction-jobs/${jobId}`);
    return {
      jobId: res.data.jobId || res.data.id || jobId,
      scanId: res.data.scanId,
      status: res.data.status?.toLowerCase() || 'running',
      stage: res.data.stage || 'running',
      message: res.data.message,
      progressPercent: res.data.progressPercent ?? res.data.progress ?? 0,
      modelUrl: res.data.modelUrl,
      previewUrl: res.data.previewUrl,
      createdAt: res.data.createdAt,
      completedAt: res.data.completedAt,
    };
  },

  getJobOutputs: async (jobId: string): Promise<ModelOutputItem[]> => {
    try {
      const res = await apiClient.get<ModelOutputItem[]>(`/reconstruction-jobs/${jobId}/outputs`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  getMyJobs: async (page = 1, limit = 20): Promise<{ jobs: ReconstructionJobItem[]; total: number }> => {
    const res = await apiClient.get<any>('/reconstruction-jobs', {
      params: { page, limit },
    });
    const content = res.data?.content || res.data?.jobs || [];
    const formatted = content.map((item: any) => ({
      jobId: item.jobId || item.id,
      scanId: item.scanId,
      status: item.status?.toLowerCase() || 'queued',
      stage: item.stage || 'queued',
      message: item.message,
      progressPercent: item.progressPercent ?? item.progress ?? 0,
      modelUrl: item.modelUrl,
      createdAt: item.createdAt,
      completedAt: item.completedAt,
    }));
    return {
      jobs: formatted,
      total: res.data?.totalElements || res.data?.total || formatted.length,
    };
  },
};
