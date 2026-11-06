// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './apiClient';
import { scanReconstructionService } from './scanReconstructionService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('scanReconstructionService', () => {
  it('uploads one image with its view hint as multipart metadata', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        image: {
          id: 'image-front',
          scan_id: 'scan-1',
          original_filename: 'front.jpg',
          file_size_bytes: 4096,
          upload_status: 'uploaded',
          view_hint: 'front',
        },
      },
    } as never);
    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });

    const image = await scanReconstructionService.uploadImage('scan-1', file, 'front');

    expect(post).toHaveBeenCalledWith(
      '/scans/scan-1/images',
      expect.any(FormData),
      expect.objectContaining({ params: { view_hint: 'front' } })
    );
    expect(image).toMatchObject({
      id: 'image-front',
      scanId: 'scan-1',
      viewHint: 'front',
      uploadStatus: 'uploaded',
    });
  });

  it('submits a preview from the scan using the front image and normalizes the job response', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        job_id: 'job-1',
        scan_id: 'scan-1',
        status: 'queued',
        progress: 0,
        created_at: '2026-10-31T00:00:00Z',
      },
    } as never);

    const job = await scanReconstructionService.submitPreviewJob('scan-1', 'image-front');

    expect(post).toHaveBeenCalledWith('/reconstructions/previews', {
      scanId: 'scan-1',
      inputImageId: 'image-front',
      profile: 'preview',
    });
    expect(job).toMatchObject({
      jobId: 'job-1',
      scanId: 'scan-1',
      status: 'queued',
      progressPercent: 0,
    });
  });

  it('submits a standard reconstruction without a single-image override', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        job_id: 'job-standard',
        scan_id: 'scan-1',
        status: 'queued',
      },
    } as never);

    await scanReconstructionService.submitJob('scan-1');

    expect(post).toHaveBeenCalledWith('/scans/scan-1/reconstruction-jobs', {
      profile: 'default',
    });
  });

  it('maps paginated snake_case jobs for the previous-models list', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        content: [{
          job_id: 'job-1',
          scan_id: 'scan-1',
          status: 'done',
          progress: 100,
          created_at: '2026-10-31T00:00:00Z',
        }],
        totalElements: 7,
      },
    } as never);

    const result = await scanReconstructionService.getMyJobs();

    expect(result.total).toBe(7);
    expect(result.jobs[0]).toMatchObject({
      jobId: 'job-1',
      scanId: 'scan-1',
      status: 'done',
      progressPercent: 100,
    });
  });

  it('maps model outputs returned by the backend', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [{
        output_id: 'output-1',
        job_id: 'job-1',
        format: 'glb',
        delivery_url: 'https://models.example/output.glb',
        file_size_bytes: 8192,
        sha256: 'abc123',
      }],
    } as never);

    const outputs = await scanReconstructionService.getJobOutputs('job-1');

    expect(outputs[0]).toMatchObject({
      id: 'output-1',
      jobId: 'job-1',
      fileFormat: 'glb',
      outputUrl: 'https://models.example/output.glb',
      fileSizeBytes: 8192,
      sha256: 'abc123',
    });
  });
});
