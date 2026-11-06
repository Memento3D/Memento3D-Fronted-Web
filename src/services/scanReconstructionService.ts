import { apiClient } from './apiClient';

export type ViewHint = 'front' | 'left' | 'right' | 'back';

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
  viewHint: ViewHint | null;
  thumbnailUrl?: string;
  previewUrl?: string;
  fullUrl?: string;
  createdAt: string;
}

export interface ReconstructionJobItem {
  jobId: string;
  scanId: string;
  status: string;
  stage?: string;
  message?: string;
  errorCode?: string;
  progressPercent: number;
  profile?: string;
  tier?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ModelOutputItem {
  id: string;
  jobId: string;
  attemptId?: string;
  fileFormat: string;
  outputUrl: string;
  fileSizeBytes: number;
  sha256?: string;
  createdAt?: string;
}

interface ApiJob {
  job_id?: string;
  jobId?: string;
  id?: string;
  scan_id?: string;
  scanId?: string;
  status?: string;
  stage?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  progress?: number | null;
  profile?: string;
  tier?: string;
  created_at?: string;
  createdAt?: string;
  completed_at?: string | null;
  completedAt?: string;
}

interface ApiModelOutput {
  output_id?: string;
  id?: string;
  job_id?: string;
  jobId?: string;
  attempt_id?: string;
  format?: string;
  delivery_url?: string;
  file_size_bytes?: number;
  sha256?: string;
  created_at?: string;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Backend response is missing ${field}.`);
  }
  return value;
}

function normalizeJob(data: ApiJob, fallbackScanId?: string): ReconstructionJobItem {
  return {
    jobId: requireString(data.job_id ?? data.jobId ?? data.id, 'job_id'),
    scanId: requireString(data.scan_id ?? data.scanId ?? fallbackScanId, 'scan_id'),
    status: requireString(data.status, 'status').toLowerCase(),
    stage: data.stage ?? undefined,
    message: data.error_message ?? undefined,
    errorCode: data.error_code ?? undefined,
    progressPercent: data.progress ?? 0,
    profile: data.profile,
    tier: data.tier,
    createdAt: data.created_at ?? data.createdAt ?? '',
    completedAt: data.completed_at ?? data.completedAt ?? undefined,
  };
}

function normalizeOutput(data: ApiModelOutput, fallbackJobId?: string): ModelOutputItem {
  return {
    id: requireString(data.output_id ?? data.id, 'output_id'),
    jobId: requireString(data.job_id ?? data.jobId ?? fallbackJobId, 'job_id'),
    attemptId: data.attempt_id,
    fileFormat: requireString(data.format, 'format'),
    outputUrl: requireString(data.delivery_url, 'delivery_url'),
    fileSizeBytes: data.file_size_bytes ?? 0,
    sha256: data.sha256,
    createdAt: data.created_at,
  };
}

export const scanReconstructionService = {
  getCapabilities: async (): Promise<ReconstructionCapabilities> => {
    const res = await apiClient.get<ReconstructionCapabilities>('/reconstruction/capabilities');
    const capabilities = res.data;
    if (
      !capabilities ||
      !Number.isInteger(capabilities.minImages) ||
      !Number.isInteger(capabilities.maxImages) ||
      capabilities.minImages < 1 ||
      capabilities.maxImages < capabilities.minImages ||
      !Array.isArray(capabilities.supportedFormats) ||
      !Number.isFinite(capabilities.maxFileSizeMb) ||
      capabilities.maxFileSizeMb <= 0
    ) {
      throw new Error('Backend returned invalid reconstruction capabilities.');
    }
    return capabilities;
  },

  createScan: async (name: string, inputMode = 'image'): Promise<ScanSession> => {
    const normalizedInputMode = inputMode.toLowerCase() === 'image_set' ? 'image' : inputMode.toLowerCase();
    const res = await apiClient.post<Record<string, unknown>>('/scans', {
      name: name.trim(),
      input_mode: normalizedInputMode,
    });
    return {
      id: requireString(res.data.id, 'scan id'),
      name: typeof res.data.name === 'string' ? res.data.name : name.trim(),
      status: typeof res.data.status === 'string' ? res.data.status : '',
      inputMode: typeof res.data.input_mode === 'string' ? res.data.input_mode : normalizedInputMode,
      imageCount: typeof res.data.file_count === 'number' ? res.data.file_count : 0,
      createdAt: typeof res.data.created_at === 'string' ? res.data.created_at : '',
    };
  },

  uploadImage: async (scanId: string, file: File, viewHint: ViewHint): Promise<ScanImageItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ image?: Record<string, unknown> }>(
      `/scans/${scanId}/images`,
      formData,
      {
        params: { view_hint: viewHint },
        headers: {
          'Content-Type': undefined,
        },
      }
    );
    const image = res.data?.image;
    if (!image) {
      throw new Error('Backend response is missing uploaded image metadata.');
    }
    return {
      id: requireString(image.id, 'image id'),
      scanId: typeof image.scan_id === 'string' ? image.scan_id : scanId,
      fileName: typeof image.original_filename === 'string' ? image.original_filename : file.name,
      fileSizeBytes: typeof image.file_size_bytes === 'number' ? image.file_size_bytes : file.size,
      uploadStatus: typeof image.upload_status === 'string' ? image.upload_status : '',
      viewHint: (image.view_hint as ViewHint | null | undefined) ?? viewHint,
      thumbnailUrl: typeof image.thumbnail_path === 'string' ? image.thumbnail_path : undefined,
      previewUrl: typeof image.preview_url === 'string' ? image.preview_url : undefined,
      fullUrl: typeof image.full_url === 'string' ? image.full_url : undefined,
      createdAt: typeof image.created_at === 'string' ? image.created_at : '',
    };
  },

  getScanImages: async (scanId: string, page = 1, limit = 100): Promise<{ images: ScanImageItem[]; total: number }> => {
    const res = await apiClient.get<{
      images?: Array<Record<string, unknown>>;
      total_count?: number;
    }>(`/scans/${scanId}/images`, {
      params: { page, limit },
    });
    const items = res.data.images ?? [];
    return {
      images: items.map((image) => ({
        id: requireString(image.id, 'image id'),
        scanId: typeof image.scan_id === 'string' ? image.scan_id : scanId,
        fileName: typeof image.original_filename === 'string' ? image.original_filename : '',
        fileSizeBytes: typeof image.file_size_bytes === 'number' ? image.file_size_bytes : 0,
        uploadStatus: typeof image.upload_status === 'string' ? image.upload_status : '',
        viewHint: (image.view_hint as ViewHint | null | undefined) ?? null,
        thumbnailUrl: typeof image.thumbnail_path === 'string' ? image.thumbnail_path : undefined,
        previewUrl: typeof image.preview_url === 'string' ? image.preview_url : undefined,
        fullUrl: typeof image.full_url === 'string' ? image.full_url : undefined,
        createdAt: typeof image.created_at === 'string' ? image.created_at : '',
      })),
      total: res.data.total_count ?? items.length,
    };
  },

  deleteScanImage: async (scanId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/scans/${scanId}/images/${imageId}`);
  },

  submitPreviewJob: async (scanId: string, frontImageId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.post<ApiJob>('/reconstructions/previews', {
      scanId,
      inputImageId: frontImageId,
      profile: 'preview',
    });
    return normalizeJob(res.data, scanId);
  },

  submitJob: async (scanId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.post<ApiJob>(`/scans/${scanId}/reconstruction-jobs`, {
      profile: 'default',
    });
    return normalizeJob(res.data, scanId);
  },

  getLatestJobForScan: async (scanId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.get<ApiJob>(`/scans/${scanId}/reconstruction-jobs`, { timeout: 20000 });
    return normalizeJob(res.data, scanId);
  },

  getJobById: async (jobId: string): Promise<ReconstructionJobItem> => {
    const res = await apiClient.get<ApiJob>(`/reconstruction-jobs/${jobId}`, { timeout: 20000 });
    return normalizeJob(res.data);
  },

  getJobOutputs: async (jobId: string): Promise<ModelOutputItem[]> => {
    const res = await apiClient.get<ApiModelOutput[]>(`/reconstruction-jobs/${jobId}/outputs`, { timeout: 30000 });
    if (!Array.isArray(res.data)) {
      throw new Error('Backend returned an invalid model output list.');
    }
    return res.data.map((output) => normalizeOutput(output, jobId));
  },

  getScanOutputs: async (scanId: string): Promise<ModelOutputItem[]> => {
    const res = await apiClient.get<ApiModelOutput[]>(`/scans/${scanId}/outputs`);
    if (!Array.isArray(res.data)) {
      throw new Error('Backend returned an invalid model output list.');
    }
    return res.data.map((output) => normalizeOutput(output));
  },

  getDemoOutputs: async (): Promise<ModelOutputItem[]> => {
    const res = await apiClient.get<ApiModelOutput[]>('/reconstruction-jobs/demo/outputs');
    if (!Array.isArray(res.data)) {
      throw new Error('Backend returned an invalid demo output list.');
    }
    return res.data.map((output) => normalizeOutput(output, 'demo'));
  },

  getMyJobs: async (page = 1, limit = 20): Promise<{ jobs: ReconstructionJobItem[]; total: number }> => {
    const res = await apiClient.get<{
      content?: ApiJob[];
      totalElements?: number;
      total_elements?: number;
    }>('/reconstruction-jobs', {
      params: { page, limit },
    });
    const items = res.data.content;
    if (!Array.isArray(items)) {
      throw new Error('Backend returned an invalid reconstruction job list.');
    }
    const jobs = items.map((item) => normalizeJob(item));
    return {
      jobs,
      total: res.data.totalElements ?? res.data.total_elements ?? jobs.length,
    };
  },
};
