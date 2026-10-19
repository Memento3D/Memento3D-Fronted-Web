# 🌐 Memento3D Frontend — Real-Time SSE & TanStack Query Optimization Guide

Hướng dẫn kiến trúc tầng Frontend (React 19 + TypeScript + TanStack Query v5 + Vite) về kết nối sự kiện thời gian thực (Server-Sent Events) và các tiêu chuẩn loại bỏ N+1 API Requests, Duplicate Queries và Waterfall Fetching.

---

## 1. Kết Nối Sự Kiện Thời Gian Thực (Server-Sent Events)

### 1.1. Luồng Hoạt Động (Architecture)
1. **Khởi tạo kết nối:** `RealTimeContext.tsx` tự động mở kết nối `EventSource` tới `/api/v1/events/stream` khi người dùng đã đăng nhập (có JWT token).
2. **Quản lý vòng đời kết nối:** Hỗ trợ cơ chế tự động kết nối lại (exponential backoff) khi mạng gián đoạn, duy trì trạng thái kết nối (`CONNECTED`, `CONNECTING`, `DISCONNECTED`).
3. **Đăng ký sự kiện (Custom Hook `useEventSubscription`):**
   ```typescript
   import { useEventSubscription } from '@/shared/realtime';

   useEventSubscription<NotificationData>('NOTIFICATION_CREATED', (event) => {
     message.info(`Thông báo mới: ${event.data.title}`);
     queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
   });
   ```

---

## 2. Các Tiêu Chuẩn TanStack Query (Tránh N+1 & Waterfall)

### 2.1. Không Gọi API Trong Vòng Lặp Hoặc Component Con
- **Không duyệt danh sách để gọi API chi tiết:** Mọi bảng dữ liệu (Table/List) nhận đầy đủ các trường thông tin cần hiển thị ngay trong DTO của API phân trang.
- **Không dùng `Promise.all()` giả lập batching:** Nếu cần nạp nhiều id, backend phải cung cấp endpoint nhận mảng id (batch fetch).

### 2.2. Kiểm Soát Điều Kiện Kích Hoạt (`enabled`)
- **Ngăn chặn 401 Cascade:** Các query yêu cầu xác thực người dùng bắt buộc phải có điều kiện `enabled: !!tokenStorage.getAccessToken()`.
- **Lazy Tab Fetching:** Với các trang có nhiều tab (như `ManagerApprovalsCenterPage.tsx`), kích hoạt query theo tab đang active:
  ```typescript
  const { data: receipts } = useQuery({
    queryKey: ['pending-receipts', warehouseId],
    queryFn: () => fetchReceipts(warehouseId),
    enabled: activeTab === 'receipts',
    staleTime: 60 * 1000,
  });
  ```

### 2.3. Chuẩn Hóa `staleTime` Cho Dữ Liệu Tham Chiếu
Các dữ liệu ít thay đổi hoặc có tính chất danh mục phải thiết lập `staleTime` hợp lý:
- **Materials:** `5 * 60 * 1000` (5 phút)
- **Warehouses:** `5 * 60 * 1000` (5 phút)
- **Categories:** `10 * 60 * 1000` (10 phút)
- **Product Details:** `5 * 60 * 1000` (5 phút)

Khi người dùng thực hiện tạo mới/cập nhật qua `useMutation`, chỉ thực hiện `invalidateQueries` đúng query key tương ứng, không refetch toàn bộ trang.
