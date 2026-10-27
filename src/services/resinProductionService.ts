import { apiClient } from './apiClient';
import type {
  ResinProductionJobResponse,
  PrepareResinProductionPayload,
  RecordSlicingPayload,
  ConfirmHandoffPayload,
  PostProcessingChecklistPayload,
  RecordQcResultPayload,
} from '../types/printJob';

export const resinProductionService = {
  /**
   * Bước 1: Chuẩn bị mô hình sản xuất từ GLB đã duyệt (kích thước mm, kiểm tra hollow/drain, xuất STL)
   */
  async prepareProductionJob(orderItemId: string, payload: PrepareResinProductionPayload): Promise<ResinProductionJobResponse> {
    const res = await apiClient.post<ResinProductionJobResponse>(
      `/production/resin/jobs/prepare/${orderItemId}`,
      payload
    );
    return res.data;
  },

  /**
   * Bước 2: Kỹ thuật viên cắt lớp trên CHITUBOX (đúng profile ELEGOO Saturn 4 Ultra 16K, resin, format .goo/.ctb)
   */
  async recordSlicing(printJobId: string, payload: RecordSlicingPayload): Promise<ResinProductionJobResponse> {
    const res = await apiClient.post<ResinProductionJobResponse>(
      `/production/resin/jobs/${printJobId}/slicing`,
      payload
    );
    return res.data;
  },

  /**
   * Bước 3: Ghi nhận bàn giao file sang máy in qua USB_MANUAL hoặc CHITU_MANAGER_LAN_MANUAL
   * Lưu ý: Thao tác này KHÔNG tự động chuyển trạng thái "Đang in" (PRINTING).
   */
  async confirmHandoff(printJobId: string, payload: ConfirmHandoffPayload): Promise<ResinProductionJobResponse> {
    const res = await apiClient.post<ResinProductionJobResponse>(
      `/production/resin/jobs/${printJobId}/handoff`,
      payload
    );
    return res.data;
  },

  /**
   * Bước 4: Người vận hành tại xưởng xác nhận máy đã bắt đầu in trên thực tế (chuyển PRINTING)
   */
  async confirmStartPrinting(printJobId: string): Promise<ResinProductionJobResponse> {
    const res = await apiClient.post<ResinProductionJobResponse>(
      `/production/resin/jobs/${printJobId}/start-printing`
    );
    return res.data;
  },

  /**
   * Bước 5: Checklist Hậu xử lý (Rửa cồn IPA/nước -> Tách support -> Đóng rắn UV -> Sơn màu nếu có yêu cầu)
   */
  async updatePostProcessing(printJobId: string, payload: PostProcessingChecklistPayload): Promise<ResinProductionJobResponse> {
    const res = await apiClient.post<ResinProductionJobResponse>(
      `/production/resin/jobs/${printJobId}/post-processing`,
      payload
    );
    return res.data;
  },

  /**
   * Bước 6: Kiểm tra chất lượng (QC inspection) - Đạt chuyển READY_FOR_DELIVERY, Hỏng ghi nhận nguyên nhân & ảnh
   */
  async recordQcResult(printJobId: string, payload: RecordQcResultPayload): Promise<ResinProductionJobResponse> {
    const res = await apiClient.post<ResinProductionJobResponse>(
      `/production/resin/jobs/${printJobId}/qc`,
      payload
    );
    return res.data;
  },

  /**
   * Bước 7: Tạo lần in lại (Reprint) khi in hỏng.
   * Giữ nguyên lịch sử lần in trước, không tính thêm chi phí khách hàng.
   */
  async createReprint(printJobId: string): Promise<ResinProductionJobResponse> {
    const res = await apiClient.post<ResinProductionJobResponse>(
      `/production/resin/jobs/${printJobId}/reprint`
    );
    return res.data;
  },

  /**
   * Lấy chi tiết hồ sơ sản xuất resin
   */
  async getJobDetails(printJobId: string): Promise<ResinProductionJobResponse> {
    const res = await apiClient.get<ResinProductionJobResponse>(
      `/production/resin/jobs/${printJobId}`
    );
    return res.data;
  },

  /**
   * Danh sách các job sản xuất resin
   */
  async listResinJobs(page = 0, limit = 20): Promise<ResinProductionJobResponse[]> {
    const res = await apiClient.get<ResinProductionJobResponse[]>(
      '/production/resin/jobs',
      { params: { page, limit } }
    );
    return res.data;
  },
};
