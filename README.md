# Memento3D — Web Client & Multi-Role Management Portals

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%2F6.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-red.svg)](https://tanstack.com/query)
[![TanStack Table](https://img.shields.io/badge/TanStack%20Table-v9-teal.svg)](https://tanstack.com/table)
[![TanStack Virtual](https://img.shields.io/badge/TanStack%20Virtual-v3-blueviolet.svg)](https://tanstack.com/virtual)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6.x-1890ff.svg)](https://ant.design/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-black.svg)](https://threejs.org/)
[![VNPAY](https://img.shields.io/badge/VNPAY-Sandbox%20v2.1.0-blue.svg)](https://sandbox.vnpayment.vn/)

---

## 📌 1. Giới Thiệu (Overview)

**Memento3D Web Client** là ứng dụng Single Page Application (SPA) hợp nhất toàn diện, phục vụ đồng thời khách hàng cá nhân (**Customer E-Commerce & 3D Order Configurator**) lẫn 6 phân hệ quản trị vận hành chuyên sâu (**Admin, Manager, Warehouse, Operator, Provider, Driver**) trong toàn bộ hệ sinh thái số hóa và chế tác in 3D Memento3D.

Ứng dụng được xây dựng trên nền tảng công nghệ **React 19 + TypeScript + Vite 8**, tích hợp bộ ba siêu tốc **TanStack Ecosystem (Query v5, Table v9, Virtual v3)**, trình hiển thị đồ họa **Three.js WebGL 3D Viewer**, thanh toán trực tuyến **VNPAY Sandbox v2.1.0**, và ngôn ngữ thiết kế độc bản **Deep Slate & Cyber Forge**.

---

## 👥 2. Hệ Thống 7 Vai Trò & Cổng Truy Cập (7 Actors & Portals)

Hệ thống điều hướng thông minh phân tách không gian làm việc chuyên biệt theo từng vai trò nghiệp vụ với URL đăng nhập và trang chủ riêng biệt:

| Actor | Vai Trò | Cổng Đăng Nhập | Không Gian Làm Việc | Quyền Hạn & Phạm Vi Nghiệp Vụ |
|---|---|---|---|---|
| **Customer** | Khách hàng mua sắm & đặt in 3D | [`/login`](http://localhost:5173/login) | `/customer/home` | Khám phá sản phẩm, tải ảnh scan 3D, xem mô hình WebGL, giỏ hàng & thanh toán VNPAY/ZaloPay/CASH |
| **Admin** | Quản trị viên hệ thống & phân quyền | [`/admin/login`](http://localhost:5173/admin/login) | `/admin/home` | Toàn quyền kiểm soát tài khoản, cấp quyền kho `WarehouseMembership`, kiểm tra audit logs |
| **Manager** | Quản lý sản xuất, vật tư & kho | [`/manager/login`](http://localhost:5173/manager/login) | `/manager/home` | Phê duyệt đơn hàng, duyệt thanh toán tiền mặt, quản lý danh mục và điều phối tài nguyên cơ sở |
| **Warehouse** | Thủ kho, nhập/xuất & kiểm kê | [`/warehouse/login`](http://localhost:5173/warehouse/login) | `/warehouse/home` | Nhập vật liệu theo số lô (F04), xuất kho sản xuất (F05) và kiểm soát tồn kho đa cơ sở |
| **Operator** | Kỹ thuật viên vận hành máy in 3D | [`/operator/login`](http://localhost:5173/operator/login) | `/operator/home` | QC Gate kiểm định ảnh scan, giám sát hàng đợi máy in 3D & quyết toán tiêu hao vật tư |
| **Provider** | Nhà cung cấp vật tư & xưởng in ngoài | [`/provider/login`](http://localhost:5173/provider/login) | `/provider/home` | Tiếp nhận đơn in gia công ngoài B2B, cập nhật tiến độ sản xuất và xác nhận kiểm định |
| **Driver** | Tài xế / Đơn vị giao nhận hàng | [`/driver/login`](http://localhost:5173/driver/login) | `/driver/home` | Quản lý trạng thái trực tuyến (Active/Busy/Offline), tiếp nhận kiện hàng và ký nhận giao |

---

## 🚀 3. Các Phân Hệ Chức Năng Chính (Core Modules)

### 🛍️ 3.1. Phân Hệ Khách Hàng (Customer E-Commerce & 3D Configurator)
- **Trang chủ Khách hàng (`/customer/home`):** Tải danh mục ngành hàng trực tiếp từ API `/api/v1/product-categories` (được cache qua TanStack Query & Redis), hiển thị danh mục sản phẩm in 3D nổi bật.
- **Trình Xem Mô Hình 3D WebGL (Three.js):** Tương tác 3D mượt mà (xoay đa trục, phóng to/thu nhỏ, di chuyển panning), xem cấu trúc lưới mesh, chuyển đổi texture và kiểm tra kích thước vật lý thực tế.
- **Cấu hình Đặt In 3D Cá Nhân Hóa:** Lựa chọn loại vật liệu (`PLA`, `Resin`, `PETG`), chọn màu sắc trực quan qua Color Swatches, điều chỉnh tỷ lệ scale và tính giá tự động theo thể tích.
- **Giỏ hàng & Đơn hàng:** Lưu trữ database, theo dõi dòng thời gian đơn hàng (Order Progress Timeline) theo thời gian thực.

### 💳 3.2. Cổng Thanh Toán Trực Tuyến Đa Dạng
- **VNPAY Sandbox Checkout (v2.1.0):**
  - Tích hợp Modal thanh toán VNPAY mượt mà, tự động chuyển tiếp tới cổng ngân hàng thanh toán qua mã băm HMAC-SHA512 an toàn.
  - Trang tiếp nhận và đối soát kết quả giao dịch tự động tại `/payment/vnpay/return`.
- **ZaloPay Sandbox & Tiền mặt (CASH):**
  - Quét mã QR ZaloPay hoặc chọn hình thức COD nhận hàng thanh toán.

### 🏭 3.3. Quản Lý Kho & Vật Liệu WMS Đa Cơ Sở (F01 - F08)
- **Danh mục Vật liệu (F01):** Khai báo chủng loại sợi/resin, thông số kỹ thuật (nhiệt độ nozzle, bed), mật độ ($g/cm^3$) và giá bán lẻ theo gram.
- **Quản lý Cơ sở Kho & Bộ điều hướng (F02):**
  - Tự động chuyển hướng `/warehouse/select` khi người dùng phụ trách từ 2 kho trở lên.
  - Cơ chế Deactivate Guard: Cảnh báo và chặn xóa/hủy kho khi còn hàng tồn kho hoặc đang giữ chỗ cho lệnh in.
- **Sổ cái nhập/xuất kho (F03 - F08):** Form nhập kho (Goods Receipt) và xuất kho (Stock Issue) nguyên tử, ghi nhận biến động tồn kho theo số lô và cuộn filament.

### 🖨️ 3.4. Vận Hành Xưởng In & Kiểm Định Ảnh (Operator QC Gate)
- **QC Inspection Viewer:** Đánh giá chất lượng ảnh scan photogrammetry (độ sắc nét Laplacian, độ sáng phơi sáng, số điểm đặc trưng SIFT, mức độ trùng lặp). Cho phép Override khi đủ điều kiện tái tạo 3D.
- **Hàng đợi Lệnh In (Print Jobs Queue):** Phân bổ file STL tới máy in 3D, theo dõi nhiệt độ đầu đùn, bàn nhiệt và quyết toán vật tư thực tế.

### 🚗 3.5. Bảng Điều Khiển Giao Vận (Driver Logistics Dashboard)
- **Bộ chuyển đổi trạng thái trực tuyến:** Tài xế chủ động bật/tắt trạng thái (`ACTIVE`, `INACTIVE`, `BUSY`, `OFFLINE`).
- **Danh sách vận đơn đang nhận:** Hiển thị địa chỉ giao hàng, số điện thoại người nhận, tổng tiền thu hộ COD và nút xác nhận hoàn tất giao hàng.

### 🔔 3.6. Kênh Thông Báo Thời Gian Thực (SSE & Toast Notifications)
- Nhận luồng sự kiện Server-Sent Events (SSE) từ backend, hiển thị huy hiệu (badge) thông báo chưa đọc và hộp thoại toast tức thì khi đơn hàng được cập nhật.

---

## ⚡ 4. Kiến Trúc Hiệu Năng Cao (TanStack Ecosystem)

Ứng dụng được tối ưu hóa toàn diện nhằm đạt chuẩn trải nghiệm mượt mà 60 FPS:
- **`@tanstack/react-query` (v5):** Đóng gói toàn bộ logic gọi API trong custom hooks (`useProducts`, `useMaterials`, `useWarehouses`, `useOrders`). Loại bỏ hoàn toàn tình trạng duplicate request, tự động làm mới dữ liệu nền khi chuyển tab.
- **`@tanstack/react-table` (v9) & `@tanstack/react-virtual` (v3):** Kỹ thuật ảo hóa DOM (Virtualization) giúp hiển thị danh sách hàng ngàn cuộn vật tư và đơn hàng với tốc độ cuộn tức thì mà không gây lag trình duyệt.

---

## 🎨 5. Ngôn Ngữ Thiết Kế (Design System)

Tuân thủ nghiêm ngặt phong cách **Deep Slate & Cyber Forge**:
- **Bảng Màu Chủ Đạo:** Nền Slate sâu (`#080c14`, `#0d121f`), viền sáng vi mô Cyan (`#0ea5e9`, `#38bdf8`), và ngọc lục bảo Emerald (`#10b981`) cho trạng thái thành công.
- **Glassmorphism:** Lớp nền bán trong suốt `backdrop-filter: blur(16px)` tạo cảm giác đa tầng công nghệ cao.
- **Typography Chuẩn Mực:**
  - `Plus Jakarta Sans`: Dành cho tiêu đề, điều hướng và văn bản chính.
  - `JetBrains Mono`: Dành cho mã SKU, thông số nhiệt độ, số lô, tọa độ và giá tiền.
- **Hỗ Trợ Tương Phản:** Chuẩn hóa hiển thị rõ nét trên cả nền tối (Dark) và nền sáng (Light), không bị chìm chữ hay mờ viền.

---

## 💻 6. Cài Đặt & Khởi Chạy (Getting Started)

### **Yêu cầu môi trường**
- **Node.js:** `18.x` hoặc `20+ LTS` (khuyên dùng Node 20+)
- **npm:** `9.x` hoặc `10.x`

### **1. Cài đặt dependencies**
```bash
cd Memento3D-Fronted-Web
npm install
```

### **2. Cấu hình biến môi trường (`.env`)**
Tạo file `.env` tại thư mục gốc của frontend:
```env
# Địa chỉ Backend REST API
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Cổng phát triển cục bộ
PORT=5173
```

### **3. Khởi chạy Development Server**
```bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ: **`http://localhost:5173`**

### **4. Kiểm tra mã nguồn & Đóng gói Production**
```bash
# Kiểm tra TypeScript type safety
npx tsc --noEmit

# Kiểm tra linting với Oxlint
npm run lint

# Chạy kiểm thử tự động với Vitest
npm run test

# Đóng gói sản phẩm production bundle
npm run build
```

---

## 📡 7. Bảng Ánh Xạ Endpoint Backend & Frontend Service

| Module | URL Giao Diện Web | Service Gọi API | Endpoint Backend Tương Ứng |
|---|---|---|---|
| **Auth** | `/login`, `/admin/login`, ... | `authApi.ts` | `POST /api/v1/auth/login` |
| **Products** | `/products`, `/customer/home` | `productApi.ts` | `GET /api/v1/products`, `/product-categories` |
| **Materials** | `/materials`, `/manager/materials` | `materialApi.ts` | `GET`, `POST /api/v1/materials` |
| **Warehouses**| `/warehouses`, `/warehouse/select` | `warehouseApi.ts` | `GET`, `POST /api/v1/warehouses` |
| **Orders** | `/orders`, `/orders/:id` | `orderApi.ts` | `GET`, `POST /api/v1/orders` |
| **Payment** | `/orders/checkout`, Modal | `paymentApi.ts` | `POST /api/v1/payments/vnpay/create` |
| **Driver** | `/driver/home` | `driverApi.ts` | `GET`, `PUT /api/v1/driver/status` |
| **Notifications** | Header Notification Dropdown | SSE Native Hook | `GET /api/v1/notifications/stream` |

---

## 👥 8. Đội Ngũ Phát Triển & Bản Quyền
- **Technical Lead & Front-End Architect:** Lê Tuấn Kiệt ([KietLT33](https://github.com/KietLT33))
- Bản quyền thuộc về **Memento3D Engineering Team**.
