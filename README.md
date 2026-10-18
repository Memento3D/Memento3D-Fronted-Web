# Memento3D — Manager Web Portal (Material, Inventory & Warehouse Operations)

![React](https://img.shields.io/badge/React-19.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x%2F6.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-red.svg)
![Axios](https://img.shields.io/badge/Axios-1.x-yellow.svg)
![License](https://img.shields.io/badge/License-Proprietary-lightgrey.svg)

---

## 📌 1. Giới Thiệu (Overview)

**Memento3D Web Portal** là phân hệ quản trị dành riêng cho **Quản lý xưởng in (Manager / Operator)** trong hệ sinh thái Memento3D. Cổng thông tin hỗ trợ vận hành chuỗi cung ứng vật liệu, quản lý hệ thống kho bãi, theo dõi mức tồn kho khả dụng theo thời gian thực và đồng bộ với các lệnh in 3D (Print Jobs).

Dự án được xây dựng với **React + TypeScript + Vite**, kết hợp cùng thư viện **TanStack Query (React Query)** và phong cách thiết kế cao cấp **Deep Slate & Cyber Forge** (Dark Mode, Glassmorphism, CSS Custom Properties).

---

## 🚀 2. Các Tính Năng Nghiệp Vụ (Core Features)

### **F01 – Material Catalog (Danh Mục Vật Liệu)**
- **Khai báo vật liệu in 3D:** Hỗ trợ đầy đủ các loại filament và resin (`PLA`, `PETG`, `ABS`, `RESIN`, `TPU`, `NYLON`, `OTHER`).
- **Thông số kỹ thuật chuẩn xưởng:** Đường kính (1.75mm, 2.85mm), mật độ nhựa ($g/cm^3$), dải nhiệt độ đầu đùn (Nozzle Temp) và bàn nhiệt (Bed Temp).
- **Mã màu trực quan (Color Swatch):** Nhận diện màu sắc vật lý qua nhãn màu và bảng mã HEX.
- **Ràng buộc SKU duy nhất:** Kiểm tra tính duy nhất của mã SKU không phân biệt hoa thường.
- **Đơn giá & Định giá vốn:** Theo dõi đơn giá vốn theo gram ($VND/g$) phục vụ tính toán chi phí in tự động.
- **Vô hiệu hóa an toàn:** Hỗ trợ Soft Deactivate để bảo vệ lịch sử in ấn quá khứ.

### **F02 – Warehouse Management (Quản Lý Cơ Sở Kho)**
- **Mạng lưới kho xưởng:** Đăng ký và quản lý các cơ sở sản xuất, kho trung chuyển với mã kho duy nhất (`code`).
- **Địa chỉ & Định vị:** Lưu vết địa chỉ thực tế và vị trí kho.
- **Bảo vệ hủy kho (Deactivate Guard):** Ngăn chặn tuyệt đối việc đóng hoặc vô hiệu hóa kho khi trong kho vẫn còn hàng tồn thực tế (`onHandGram > 0`) hoặc đang có lượng vật liệu được giữ cho lệnh in (`reservedGram > 0`).

### **F03 - F08 – Inventory Control & Print Job Roadmap**
- **F03 – Tồn kho khả dụng (Available Gram):** Công thức $\text{Available} = \text{On-Hand} - \text{Reserved}$.
- **F04 – Nhập kho (Goods Receipt):** Tăng tồn kho nguyên tử kèm mã Idempotency chống gửi lặp.
- **F05 – Xuất kho (Manual Issue):** Xuất hủy/kiểm định với lý do bắt buộc và khóa dòng chống race condition.
- **F06 – Giữ vật liệu cho Job (Reservation):** Khóa tạm thời lượng nhựa trước khi in.
- **F07 – Cấp phát & Đối soát tiêu hao (Reconciliation):** Đối soát $\text{Issued} = \text{Used} + \text{Waste} + \text{Returned}$.
- **F08 – Sổ cái bất biến (Immutable Ledger):** Lịch sử biến động kho kiểm toán minh bạch.

---

## 🎨 3. Phong Cách Thiết Kế (Design System)

Tuân thủ quy chuẩn thiết kế **Deep Slate & Cyber Forge**:
- **Bảng màu:** Nền tối sâu Slate (`#080c14`, `#0d121f`), điểm nhấn Cyan Cyber (`#0ea5e9`, `#38bdf8`) và viền phát sáng vi mô.
- **Glassmorphism:** Sử dụng `backdrop-filter: blur(16px)` trên nền bán trong suốt để tạo chiều sâu giao diện.
- **Typography:** Phông chữ hiện đại `Plus Jakarta Sans` cho văn bản điều hướng và `JetBrains Mono` cho mã SKU, số liệu kỹ thuật và đơn giá.
- **Micro-interactions:** Hiệu ứng hover mượt mà, phản hồi toast, loading indicator và dialog xác nhận thao tác rủi ro.

---

## 🏗️ 4. Cấu Trúc Mã Nguồn (Project Structure)

```text
Memento3D-Fronted-Web/
├── index.html                      # HTML root với Google Fonts (Plus Jakarta Sans, JetBrains Mono)
├── package.json                    # Cấu hình dependencies và build scripts
├── tsconfig.json                   # TypeScript compiler configuration (Strict Mode)
├── vite.config.ts                  # Vite build tooling
├── src/
│   ├── main.tsx                    # Entry point gắn kết React DOM
│   ├── App.tsx                     # React Router & QueryClient Provider
│   ├── index.css                   # Custom CSS Design Tokens & Utilities
│   ├── types/                      # Định nghĩa kiểu dữ liệu TypeScript
│   │   ├── material.ts             # Material, MaterialType, DTO payloads
│   │   └── warehouse.ts            # Warehouse, WarehouseStatus, DTO payloads
│   ├── services/                   # Tầng gọi API qua HTTP Client
│   │   ├── apiClient.ts            # Axios instance có JWT Interceptor và Error Handler
│   │   ├── materialService.ts      # CRUD API call cho Material Catalog (F01)
│   │   └── warehouseService.ts     # CRUD API call cho Warehouse Facilities (F02)
│   ├── components/                 # Các component dùng chung
│   │   └── layout/
│   │       └── AppLayout.tsx       # Sidebar navigation, Topbar, Role indicator
│   └── pages/                      # Các trang chức năng
│       ├── materials/
│       │   ├── MaterialListPage.tsx # Bảng danh mục vật liệu, bộ lọc, thẻ KPI
│       │   └── MaterialModal.tsx    # Modal tạo / sửa thông số vật liệu
│       └── warehouses/
│           ├── WarehouseListPage.tsx # Danh sách kho bãi, kiểm tra tồn trước khi xóa
│           └── WarehouseModal.tsx    # Modal tạo / sửa cơ sở kho
```

---

## 💻 5. Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### **Yêu cầu hệ thống**
- **Node.js:** phiên bản `18.x` trở lên (Khuyến nghị Node `20+` hoặc `24.x`).
- **npm:** phiên bản `9.x` trở lên.

### **1. Cài đặt thư viện**
```bash
npm install
```

### **2. Cấu hình biến môi trường**
Tạo file `.env` tại thư mục gốc:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### **3. Chạy môi trường Development**
```bash
npm run dev
```
Truy cập: `http://localhost:5173`

### **4. Kiểm tra TypeScript & Đóng gói Production**
```bash
npm run build
```

---

## 📡 6. Bảng Ánh Xạ Endpoint Backend

| Chức năng | Phương thức | Endpoint Backend | Quyền hạn yêu cầu |
|---|---|---|---|
| Danh sách vật liệu | `GET` | `/api/v1/materials` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Tạo vật liệu mới | `POST` | `/api/v1/materials` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Chi tiết vật liệu | `GET` | `/api/v1/materials/:id` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Sửa vật liệu | `PATCH` | `/api/v1/materials/:id` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Vô hiệu hóa vật liệu | `DELETE`| `/api/v1/materials/:id` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Danh sách kho | `GET` | `/api/v1/warehouses` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Tạo kho mới | `POST` | `/api/v1/warehouses` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Chi tiết kho | `GET` | `/api/v1/warehouses/:id` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Sửa kho | `PATCH` | `/api/v1/warehouses/:id` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| Vô hiệu hóa kho | `DELETE`| `/api/v1/warehouses/:id` | `ROLE_ADMIN`, `ROLE_OPERATOR` |

---

## 👥 7. Đội Ngũ Phát Triển
- **Technical Lead & Architect:** Lê Tuấn Kiệt (KietLT)
- **Repository:** [Memento3D-Fronted-Web](https://github.com/Memento3D/Memento3D-Fronted-Web)
