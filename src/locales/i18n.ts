import commonVi from './vi/common.json';
import authVi from './vi/auth.json';
import orderVi from './vi/order.json';
import paymentVi from './vi/payment.json';
import reconstructionVi from './vi/reconstruction.json';
import printingVi from './vi/printing.json';
import warehouseVi from './vi/warehouse.json';
import adminVi from './vi/admin.json';
import productVi from './vi/product.json';

export const locales = {
  vi: {
    common: commonVi,
    auth: authVi,
    order: orderVi,
    payment: paymentVi,
    reconstruction: reconstructionVi,
    printing: printingVi,
    warehouse: warehouseVi,
    admin: adminVi,
    product: productVi,
  },
};

export type LocaleKey = keyof typeof locales;

/**
 * Access translation string using dot notation, e.g. t('common.save') or t('auth.welcomeBack', { name: 'Kiet' })
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const parts = key.split('.');
  let current: any = locales.vi;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback: return last part or the key itself
      return parts[parts.length - 1] || key;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  let result = current;
  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    }
  }

  return result;
}

/**
 * Status mappings to user-friendly Vietnamese text
 */
export const STATUS_MAPPINGS: Record<string, string> = {
  // Common & Generic
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm ngưng',
  ENABLED: 'Đã kích hoạt',
  DISABLED: 'Đã vô hiệu',
  PENDING: 'Đang chờ',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  SUCCESS: 'Thành công',
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã gửi duyệt',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Đã từ chối',
  APPLIED: 'Đã áp dụng',

  // Order Specific
  PENDING_PAYMENT: 'Chờ thanh toán',
  MODEL_APPROVAL_PENDING: 'Chờ duyệt mô hình 3D',
  CONFIRMED: 'Đã xác nhận',
  PRINTING: 'Đang in 3D',
  READY: 'Hoàn thiện (Sẵn sàng)',
  SHIPPED: 'Đang giao hàng',
  DELIVERED: 'Đã giao thành công',
  REFUNDED: 'Đã hoàn tiền',

  // Payment
  PAID: 'Đã thanh toán',

  // Print Job & Farm
  CREATED: 'Đang chờ hàng đợi',
  QUEUED: 'Đang chờ hàng đợi',
  RESERVED: 'Đã giữ trước',
  ISSUED: 'Đã xuất vật liệu',

  // Warehouse Transfer & Delivery
  IN_TRANSIT: 'Đang vận chuyển',
  RECEIVED: 'Đã nhận hàng',
  ASSIGNED: 'Đã phân công',
  PICKED_UP: 'Đã lấy hàng',

  // Stock Counts
  PLANNED: 'Lập kế hoạch',
  IN_PROGRESS: 'Đang kiểm kê',

  // Provider Orders
  PENDING_ACCEPT: 'Chờ tiếp nhận',
  IN_PRODUCTION: 'Đang sản xuất',
  QC_PASSED: 'Đạt kiểm định QC',
  READY_FOR_PICKUP: 'Sẵn sàng lấy hàng',

  // Priorities
  NORMAL: 'Bình thường',
  HIGH: 'Ưu tiên cao',
  RUSH: 'Hỏa tốc (Gấp)',
};

export function getStatusLabel(status?: string | null): string {
  if (!status) return 'Không xác định';
  const clean = status.trim().toUpperCase();
  return STATUS_MAPPINGS[clean] || status;
}

/**
 * Role mappings to Vietnamese display text
 */
export const ROLE_MAPPINGS: Record<string, string> = {
  ROLE_ADMIN: 'Quản trị viên',
  ADMIN: 'Quản trị viên',
  ROLE_MANAGER: 'Quản lý',
  MANAGER: 'Quản lý',
  ROLE_WAREHOUSE: 'Thủ kho',
  ROLE_WAREHOUSE_STAFF: 'Nhân viên kho',
  WAREHOUSE: 'Thủ kho',
  ROLE_OPERATOR: 'Kỹ thuật viên in 3D',
  OPERATOR: 'Kỹ thuật viên in 3D',
  ROLE_PROVIDER: 'Nhà cung cấp',
  PROVIDER: 'Nhà cung cấp',
  ROLE_DRIVER: 'Tài xế giao hàng',
  DRIVER: 'Tài xế giao hàng',
  ROLE_USER: 'Khách hàng',
  ROLE_CUSTOMER: 'Khách hàng',
  CUSTOMER: 'Khách hàng',
  USER: 'Khách hàng',
};

export function getRoleLabel(role?: string | null): string {
  if (!role) return 'Người dùng';
  const clean = role.trim().toUpperCase();
  return ROLE_MAPPINGS[clean] || role.replace('ROLE_', '');
}

/**
 * Inventory Movement / Transaction Types mapping
 */
export const MOVEMENT_TYPE_MAPPINGS: Record<string, string> = {
  RECEIPT: 'Nhập kho',
  ISSUE: 'Xuất kho',
  RESERVATION_HOLD: 'Giữ trước cho lệnh in',
  RESERVATION_RELEASE: 'Giải phóng giữ trước',
  PRINT_ISSUE: 'Xuất in thực tế',
  PRINT_RETURN: 'Hoàn trả sau in',
  TRANSFER_IN: 'Nhập chuyển kho',
  TRANSFER_OUT: 'Xuất chuyển kho',
  ADJUSTMENT_INCREASE: 'Điều chỉnh tăng',
  ADJUSTMENT_DECREASE: 'Điều chỉnh giảm',
  STOCK_COUNT_ADJUSTMENT: 'Điều chỉnh kiểm kê',
};

export function getMovementTypeLabel(type?: string | null): string {
  if (!type) return 'Biến động kho';
  const clean = type.trim().toUpperCase();
  return MOVEMENT_TYPE_MAPPINGS[clean] || type;
}

/**
 * Friendly API Error Messages
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'Có lỗi xảy ra. Vui lòng thử lại.';

  // Check HTTP status code
  const status = error.response?.status || error.status;
  if (status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  if (status === 404) {
    return 'Không tìm thấy dữ liệu yêu cầu.';
  }
  if (status === 409) {
    return 'Dữ liệu đang bị xung đột hoặc đã tồn tại trên hệ thống.';
  }
  if (status >= 500) {
    return 'Hệ thống máy chủ đang bận hoặc gặp sự cố. Vui lòng thử lại sau.';
  }

  // Check message in response
  const responseMsg = error.response?.data?.message || error.response?.data?.error;
  if (typeof responseMsg === 'string' && responseMsg.length > 0) {
    // Translate common raw English server errors if encountered
    if (responseMsg.includes('Bad credentials')) return 'Email hoặc mật khẩu không chính xác.';
    if (responseMsg.includes('Access is denied')) return 'Bạn không có quyền thực hiện thao tác này.';
    if (responseMsg.includes('insufficient stock') || responseMsg.includes('Insufficient available stock')) {
      return 'Số lượng tồn kho khả dụng không đủ để thực hiện thao tác này.';
    }
    if (responseMsg.includes('already exists')) return 'Bản ghi dữ liệu này đã tồn tại trên hệ thống.';
    return responseMsg;
  }

  if (typeof error.message === 'string') {
    if (error.message.includes('Network Error')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.';
    }
    if (error.message.includes('timeout')) {
      return 'Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại.';
    }
    return error.message;
  }

  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}

/**
 * React Hook for translations
 */
export function useTranslation() {
  return {
    t,
    getStatusLabel,
    getRoleLabel,
    getMovementTypeLabel,
    getFriendlyErrorMessage,
    locale: 'vi',
  };
}
