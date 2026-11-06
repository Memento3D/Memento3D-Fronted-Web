# Kế hoạch triển khai FE custom MVP

## Trạng thái đã chốt

- Cập nhật 06/11: đã nối đặt in custom trên BE + web và đồng bộ source app; V30 đã áp dụng. Xem [luồng đặt sản xuất custom](26-custom-print-checkout-flow.md) cho snapshot bất biến, xuất file, duyệt kỹ thuật và báo giá/thanh toán.

- Neon đã áp dụng V27–V29. Catalog `mvp-v1` ACTIVE, 3 asset, 15 object B2 đã đối chiếu checksum.
- BE local đã build, khởi động và healthy; Swagger có endpoint scene/draft. Chưa xác nhận luồng tạo job mới đến lưu custom xuyên suốt.
- `src/services/modelCustomizationService.ts` đã có type và service theo API thực tế. TypeScript đã kiểm tra thành công.
- FE đã nối output ID vào `ModelCustomizationWorkspace`, thêm `CustomizationViewer` với root chung, panel thumbnail responsive, lưu/khôi phục draft, xử lý revision conflict và refresh signed URL. Đã kiểm tra 12 kịch bản Chrome với API mô phỏng và GLB thật, gồm desktop/mobile, lỗi mạng/asset, 409, Back và draft chưa lưu. Chưa kiểm chứng end-to-end bằng job mới qua toàn bộ BE/AI. Xem [kết quả rà soát web](24-web-model-flow-review.md).
- AI Swagger bổ sung Authorize `HeadApiKey` (header `X-API-Key`). Cần restart AI để nhận source mới; không nhúng key vào FE hoặc tài liệu.
- Hợp đồng API thực tế: [20-fe-customization-api-contract.md](20-fe-customization-api-contract.md). Tài liệu 19 là đề xuất trước đây; route/model-version và preset trong đó không phải hợp đồng đang triển khai.

## 1. Nối dữ liệu và vòng đời màn hình

Tệp chính: `ScanReconstructionPage.tsx`, `MyModelsPage.tsx`, service và hook mới `useModelCustomization`.

- Giữ `modelOutputId` khi chọn GLB, thay vì chỉ giữ URL. Gọi scene sau khi output sẵn sàng, không gọi liên tục theo progress.
- Phân biệt scene server, bản lựa chọn đã lưu và bản đang chỉnh. GET scene khởi tạo từ `customization.selection`.
- Hủy request khi đổi output/rời trang; không để response cũ ghi đè model mới. Không giữ asset/fit của người trước.
- Output legacy vẫn dùng viewer GLB hiện tại. Chỉ mã lỗi `CUSTOMIZATION_NOT_AVAILABLE` mới chuyển về chế độ legacy; lỗi mạng/quyền phải có thông báo đúng và nút thử lại.
- Mở từ danh sách model cũng dùng cùng output ID và luồng scene để giữ nguyên thiết kế.

Hoàn thành khi một scene cấp đủ dữ liệu cho viewer và panel, mở lại được bản lưu, model cũ vẫn xem được.

## 2. Viewer lắp ghép trên cùng hệ tọa độ

Tệp chính: `Keepsake3DViewer.tsx`; tách phần tải/quản lý scene thành hook/helper để tránh dồn logic UI và Three.js.

- Một canvas, một root chung chứa base và các nhóm asset theo slot. Căn giữa/đặt đáy ở root chung, không căn riêng từng mesh.
- Base load một lần theo output/sha. Phụ kiện áp `matrixColumnMajor` đúng một lần; `fitted_geometry` đã fit theo base, không tự suy ra vị trí từ bounding box.
- Camera/framing theo base; đổi kính, mũ/tóc không reset góc nhìn. Làm mới signed URL không dựng lại toàn bộ scene nếu hash không đổi.
- Chỉ tải asset mặc định/được chọn; cache trong phiên theo output/fit/version/hash. Không preload mọi mẫu tương lai; không dùng signed URL làm định danh thiết kế.
- Chuyển slot atomically sau khi asset mới tải thành công; giữ mẫu cũ khi lỗi. Chặn kết quả tải cũ nếu người dùng đổi lựa chọn nhanh.
- Dispose geometry/material/texture đúng vòng đời; tài nguyên đang dùng chung không bị dispose khi chỉ đổi slot. Cleanup khi đổi model/rời trang.

Hoàn thành khi chuyển mũ/tóc/kính không lệch tọa độ, không tạo thêm request AI và không mất camera.

## 3. Panel tùy chỉnh và bố cục

Component mới: `CustomizationPanel`, `AssetOptionCard`, `CustomizationSaveBar`.

- Desktop: viewer ở trái, panel khoảng 320–360 px bên phải. Màn hình hẹp xếp panel dưới viewer; tránh cuộn lồng nhau và tránh che điều khiển 3D.
- Nhóm "Kiểu đầu": mũ hoặc tóc; nhóm "Mắt kính": không kính hoặc mẫu kính. Render theo `groups`/`assetVersionIds` của server, không khóa cấu trúc vào đúng ba asset.
- Mỗi lựa chọn có thumbnail, tên, trạng thái được chọn, đang tải và lỗi; dùng radio/button có nhãn, điều khiển được bằng bàn phím. Không tạo canvas thumbnail riêng.
- Thanh lưu có "Chưa lưu"/"Đã lưu", "Khôi phục bản đã lưu" và "Lưu thiết kế". Nút Lưu disabled khi không đổi, đang tải phụ kiện, đang lưu hoặc không có quyền chỉnh.
- Tách nhóm dữ liệu để sau này thêm body/pose mà không phải thay layout. MVP chỉ hiển thị nhóm server thực sự hỗ trợ, không thêm control body/pose chưa có API.

## 4. Lưu, xung đột và URL hết hạn

- Click thumbnail chỉ cập nhật local preview; PUT chỉ khi bấm Lưu, gửi đủ slot, `fitResultId`, revision và UUID asset-version.
- Lưu thành công cập nhật revision/bản đã lưu từ response; không ghi đè các lựa chọn người dùng vừa chỉnh trong lúc request đang chạy.
- 409 revision: giữ bản đang chỉnh, báo có bản mới từ thiết bị khác, cho tải lại bản lưu. Không tự retry ghi đè.
- Scene `editable=false`: cho xem bản lưu, khóa thay đổi. Cảnh báo khi rời trang nếu còn thay đổi chưa lưu, theo cơ chế navigation hiện có.
- Asset URL hết hạn: lấy scene mới, đối chiếu output/fit/hash, giữ camera và lựa chọn local còn hợp lệ; chỉ retry tải một lần. Không retry vô hạn hoặc reset draft âm thầm.

## 5. Điểm đặt sản xuất

Luồng đặt hàng hiện tại chưa có snapshot custom/export bất biến. Không để nút đặt sản xuất báo rằng thiết kế custom đã được gửi in trong khi BE chưa lưu snapshot đó.

Trong giai đoạn FE preview/save, thông báo rõ tính năng lưu thiết kế; chặn đi tiếp với custom nếu chưa có hợp đồng checkout tương ứng. Bước sau mới nối snapshot theo order item, final version và export file in. `readyForMachine=false` luôn được tôn trọng.

## Thứ tự thực hiện và kiểm tra

Làm lần lượt 1 → 2 → 3 → 4, rồi xử lý điểm đặt sản xuất ở bước 5. Không chạy lại AI cho từng chỉnh sửa. Sau khi hoàn thiện source, kiểm tra TypeScript/build một lượt và kiểm tra trực tiếp một model mới: chọn tóc/mũ, bật/tắt kính, lưu, mở lại; kiểm tra mobile và một lỗi revision. Chỉ chạy thêm kiểm tra khi có lỗi hoặc thay đổi cần xác minh.
