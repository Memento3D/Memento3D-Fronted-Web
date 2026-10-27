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
      // Graceful fallback defaults (Hunyuan3D-2 single-view to multi-view)
      return {
        provider: 'FASTAPI',
        minImages: 1,
        maxImages: 50,
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSizeMb: 20,
        guidelines: 'Hỗ trợ chụp từ 1 ảnh góc chuẩn bằng camera laptop hoặc tải 1-50 ảnh đa góc. AI Hunyuan3D-2 tối ưu cho chủ thể chân dung, tượng nhỏ, đồ thủ công trong điều kiện đủ sáng.',
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
    const res = await apiClient.post<any>(`/scans/${scanId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const imgData = res.data?.image || res.data;
    return {
      id: imgData.id,
      scanId: imgData.scan_id || scanId,
      fileName: imgData.original_filename || file.name,
      fileSizeBytes: imgData.file_size_bytes || file.size,
      uploadStatus: imgData.upload_status || 'uploaded',
      thumbnailUrl: imgData.thumbnail_path,
      previewUrl: imgData.preview_url,
      fullUrl: imgData.full_url,
      createdAt: imgData.created_at,
    };
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
    const data = res.data;
    return {
      jobId: data.job_id || data.jobId || data.id,
      scanId: data.scan_id || data.scanId || scanId,
      status: (data.status || 'queued').toLowerCase() as any,
      stage: data.stage || 'queued',
      message: data.error_message || data.errorMessage || data.message,
      progressPercent: data.progress ?? data.progressPercent ?? 0,
      modelUrl: data.modelUrl,
      createdAt: data.created_at || data.createdAt,
    };
  },

  getLatestJobForScan: async (scanId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.get<any>(`/scans/${scanId}/reconstruction-jobs`);
    const data = res.data;
    return {
      jobId: data.job_id || data.jobId || data.id,
      scanId: data.scan_id || data.scanId || scanId,
      status: (data.status || 'queued').toLowerCase() as any,
      stage: data.stage || 'queued',
      message: data.error_message || data.errorMessage || data.message,
      progressPercent: data.progress ?? data.progressPercent ?? 0,
      modelUrl: data.modelUrl,
      createdAt: data.created_at || data.createdAt,
      completedAt: data.completed_at || data.completedAt,
    };
  },

  getJobById: async (jobId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.get<any>(`/reconstruction-jobs/${jobId}`);
    const data = res.data;
    return {
      jobId: data.job_id || data.jobId || data.id || jobId,
      scanId: data.scan_id || data.scanId,
      status: (data.status || 'running').toLowerCase() as any,
      stage: data.stage || 'running',
      message: data.error_message || data.errorMessage || data.message,
      progressPercent: data.progress ?? data.progressPercent ?? 0,
      modelUrl: data.modelUrl,
      previewUrl: data.previewUrl,
      createdAt: data.created_at || data.createdAt,
      completedAt: data.completed_at || data.completedAt,
    };
  },

  getJobOutputs: async (jobId: string): Promise<ModelOutputItem[]> => {
    try {
      const res = await apiClient.get<any[]>(`/reconstruction-jobs/${jobId}/outputs`);
      const items = res.data || [];
      return items.map((it: any) => ({
        id: it.output_id || it.id,
        jobId: it.job_id || it.jobId || jobId,
        fileFormat: it.format || it.file_format || 'glb',
        outputUrl: it.delivery_url || it.deliveryUrl || it.outputUrl || it.url,
        fileSizeBytes: it.file_size_bytes || it.fileSizeBytes || 0,
        isPrimary: it.is_primary ?? true,
        storageProvider: it.storage_provider || it.storageProvider,
      }));
    } catch {
      return [];
    }
  },

  getDemoOutputs: async (): Promise<ModelOutputItem[]> => {
    try {
      const res = await apiClient.get<any[]>('/reconstruction-jobs/demo/outputs');
      const items = res.data || [];
      return items.map((it: any) => ({
        id: it.output_id || it.id,
        jobId: it.job_id || it.jobId || 'demo',
        fileFormat: it.format || 'glb',
        outputUrl: it.delivery_url || it.outputUrl,
        fileSizeBytes: it.file_size_bytes || 0,
        isPrimary: true,
        storageProvider: 'demo',
      }));
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
