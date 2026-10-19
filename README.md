# Memento3D — Web Client & Multi-Role Management Portals

![React](https://img.shields.io/badge/React-19.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x%2F6.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-red.svg)
![Axios](https://img.shields.io/badge/Axios-1.x-yellow.svg)
![Design System](https://img.shields.io/badge/Design-Deep%20Slate%20%26%20Cyber%20Forge-cyan.svg)

---

## 📌 1. Giới Thiệu (Overview)

**Memento3D Web Frontend** là ứng dụng Single Page Application (SPA) hợp nhất toàn diện, phục vụ cả khách hàng cá nhân (**Customer E-Commerce & 3D Order**) lẫn 6 phân hệ quản trị vận hành chuyên sâu (**Admin, Manager, Warehouse, Operator, Provider, Driver**) trong toàn bộ hệ sinh thái in 3D Memento3D.

Hệ thống được phát triển trên nền tảng **React 19 + TypeScript + Vite**, tích hợp **TanStack Query (v5)** để đồng bộ trạng thái server thời gian thực, **Axios Interceptor** xử lý xác thực JWT đa cổng, và hệ thống giao diện **Deep Slate & Cyber Forge** (Dark Mode, Glassmorphism cao cấp, viền phát sáng gradient vi mô).

---

## 👥 2. Hệ Thống 7 Vai Trò & Cổng Truy Cập (7 Actors & Portals)

Hệ thống phân tách không gian làm việc chuyên biệt theo từng vai trò nghiệp vụ với URL đăng nhập và trang chủ riêng biệt:

| Actor | Vai Trò | Cổng Đăng Nhập | Trang Chủ Sau Đăng Nhập | Tài Khoản Test Chuẩn | Mật Khẩu |
|---|---|---|---|---|:---:|
| **Customer** | Khách hàng mua sắm & đặt in 3D | `/login` | `/customer/home` | `customer@memento3d.vn` | `123456` |
| **Admin** | Quản trị viên hệ thống & phân quyền | `/admin/login` | `/admin/home` | `admin@memento3d.vn` | `123456` |
| **Manager** | Quản lý sản xuất, vật tư & kho | `/manager/login` | `/manager/home` | `manager@memento3d.vn` | `123456` |
| **Warehouse** | Thủ kho, nhập/xuất & kiểm kê | `/warehouse/login` | `/warehouse/home` | `warehouse@memento3d.vn` | `123456` |
| **Operator** | Kỹ thuật viên vận hành máy in 3D | `/operator/login` | `/operator/home` | `operator@memento3d.vn` | `123456` |
| **Provider** | Nhà cung cấp vật tư & máy móc | `/provider/login` | `/provider/home` | `provider@memento3d.vn` | `123456` |
| **Driver** | Tài xế / Đơn vị giao nhận hàng | `/driver/login` | `/driver/home` | `driver@memento3d.vn` | `123456` |

*(Lưu ý: Hệ thống cũng hỗ trợ domain dự phòng song song `@memento3d.com` với mật khẩu chung `123456`)*.

---

## 🚀 3. Các Phân Hệ Chức Năng Chính (Core Modules)

### 🛍️ A. Phân Hệ Khách Hàng (Customer E-Commerce & 3D Orders)
- **Customer Home (`/customer/home`):** Tải trực tiếp danh mục ngành hàng thực tế từ API `/product-categories`, hiển thị bộ sưu tập sản phẩm in 3D nổi bật.
- **Product Catalog (`/products`):** Tìm kiếm, lọc theo chất liệu, công nghệ in và xem chi tiết sản phẩm 3D.
- **Customer Auth:** Đăng ký tài khoản mới (`/register`), đăng nhập bảo mật bằng Email/Password hoặc Google OAuth2.

### 🏭 B. Quản Lý Vật Liệu & Kho Hàng (Materials & Warehouses - F01 -> F08)
- **Material Catalog (F01):** Khai báo và quản lý chủng loại filament/resin (`PLA`, `PETG`, `ABS`, `RESIN`, `TPU`), thông số kỹ thuật (đường kính, nhiệt độ đầu đùn, bàn nhiệt), mã màu trực quan (Color Swatch) và giá vốn theo gram ($VND/g$).
- **Warehouse Management (F02):** Đăng ký cơ sở kho, quản lý địa chỉ, kiểm soát an toàn trước khi đóng kho (Deactivate Guard - chặn xóa khi `onHandGram > 0` hoặc `reservedGram > 0`).
- **Inventory Ledger & Print Jobs (F03 - F08):** Tính toán tồn khả dụng ($\text{Available} = \text{On-Hand} - \text{Reserved}$), phiếu nhập kho nguyên tử (Goods Receipt), xuất kho kiểm định (Manual Issue) và khóa giữ vật liệu cho lệnh in 3D.

### 🛡️ C. Đăng Nhập & Bảo Mật Dữ Liệu Thật (Real-Data Authentication)
- Form đăng nhập sạch sẽ, chuyên nghiệp, kết nối 100% với PostgreSQL Database và Spring Security backend.
- Phân biệt vai trò chính xác, chuyển hướng đúng cổng điều hành sau khi xác thực thành công.
- Lưu trữ access token an toàn, cơ chế refresh token và tự động xử lý khi hết hạn phiên làm việc.

---

## 🎨 4. Phong Cách Thiết Kế (Design System)

Tuân thủ chặt chẽ tiêu chuẩn thẩm mỹ **Deep Slate & Cyber Forge**:
- **Bảng Màu Sang Trọng:** Nền tối sâu Slate (`#080c14`, `#0d121f`), điểm nhấn Cyber Cyan (`#0ea5e9`, `#38bdf8`) và Emerald (`#10b981`) cho trạng thái thành công.
- **Hiệu Ứng Glassmorphism:** Lớp nền bán trong suốt với `backdrop-filter: blur(16px)` tạo chiều sâu không gian đa lớp.
- **Typography Hiện Đại:** Phông chữ `Plus Jakarta Sans` cho văn bản điều hướng và `JetBrains Mono` cho mã SKU, thông số kỹ thuật, số dư tồn kho và giá tiền.
- **Micro-Interactions:** Hiệu ứng hover nhấp nháy tinh tế, thẻ thống kê KPI phát sáng, modal chuyển tiếp mượt mà.

---

## 🏗️ 5. Cấu Trúc Mã Nguồn (Project Structure)

```text
Memento3D-Fronted-Web/
├── index.html                      # HTML root với Google Fonts (Plus Jakarta Sans, JetBrains Mono)
├── package.json                    # Cấu hình dependencies và scripts
├── tsconfig.json                   # Cấu hình TypeScript Strict Mode
├── vite.config.ts                  # Vite build tooling
├── src/
│   ├── main.tsx                    # Entry point gắn kết React DOM
│   ├── App.tsx                     # React Router & QueryClient Provider
│   ├── index.css                   # Custom CSS Design Tokens & Utilities
│   ├── features/                   # Tính năng chia theo Domain
│   │   ├── auth/                   # Authentication (LoginForm, RegisterForm, GoogleAuth)
│   │   ├── customer/               # Customer Home & Customer Portal
│   │   ├── products/               # Danh mục sản phẩm & chi tiết sản phẩm
│   │   ├── materials/              # Quản lý vật liệu in 3D (F01)
│   │   └── warehouses/             # Quản lý cơ sở kho (F02)
│   ├── pages/                      # Các trang Dashboard và Home theo từng Actor
│   │   ├── AdminHomePage.tsx       # /admin/home
│   │   ├── ManagerHomePage.tsx     # /manager/home
│   │   ├── WarehouseHomePage.tsx   # /warehouse/home
│   │   ├── OperatorHomePage.tsx    # /operator/home
│   │   ├── ProviderHomePage.tsx    # /provider/home
│   │   └── DriverHomePage.tsx      # /driver/home
│   ├── services/                   # Tầng gọi API qua Axios
│   │   ├── apiClient.ts            # Axios instance, Interceptors & Error handling
│   │   ├── authApi.ts              # API xác thực, đăng ký, đăng nhập
│   │   ├── categoryApi.ts          # API danh mục sản phẩm (Categories)
│   │   ├── productApi.ts           # API sản phẩm in 3D
│   │   ├── materialService.ts      # API danh mục vật liệu (F01)
│   │   └── warehouseService.ts     # API cơ sở kho bãi (F02)
│   └── components/                 # Các component dùng chung (Layout, Navbar, Modal...)
```

---

## 💻 6. Cài Đặt & Khởi Chạy (Getting Started)

### **Yêu cầu hệ thống**
- **Node.js:** `18.x` trở lên (Khuyến nghị `20+`).
- **npm:** `9.x` trở lên.

### **1. Cài đặt thư viện**
```bash
npm install
```

### **2. Cấu hình biến môi trường (`.env`)**
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### **3. Chạy môi trường Development**
```bash
npm run dev
```
Truy cập: `http://localhost:5173` (hoặc cổng hiển thị trên terminal).

### **4. Kiểm tra mã nguồn & Đóng gói Production**
```bash
npm run build
```

---

## 📡 7. Bảng Ánh Xạ Endpoint Backend

| Chức năng | Phương thức | Endpoint Backend | Vai trò cho phép |
|---|---|---|---|
| Đăng nhập tài khoản | `POST` | `/api/v1/auth/login` | Mọi vai trò |
| Đăng ký khách hàng | `POST` | `/api/v1/auth/register` | Khách vãng lai |
| Danh mục ngành hàng | `GET` | `/api/v1/product-categories` | Public / Customer |
| Danh sách sản phẩm | `GET` | `/api/v1/products` | Public / Customer |
| Danh mục vật liệu | `GET` / `POST` | `/api/v1/materials` | `MANAGER`, `OPERATOR`, `ADMIN` |
| Quản lý kho bãi | `GET` / `POST` | `/api/v1/warehouses` | `MANAGER`, `WAREHOUSE`, `ADMIN` |

---

## 👥 8. Đội Ngũ Phát Triển
- **Technical Lead & Front-End Architect:** Lê Tuấn Kiệt (KietLT)
- **Repository:** [Memento3D-Fronted-Web](https://github.com/Memento3D/Memento3D-Fronted-Web)
