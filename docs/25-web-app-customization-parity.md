# Đồng bộ luồng model web và app — 06/11/2026

**Cập nhật:** Đã mở rộng sang đặt in custom theo quyết định tiếp theo. Xem [26-custom-print-checkout-flow.md](26-custom-print-checkout-flow.md); giới hạn checkout ở dưới là trạng thái của giai đoạn preview/save trước đó.

Luồng web tạo model → tiến trình → custom → lưu → mở lại đã được hoàn thiện trong phạm vi preview/save. Chi tiết và 12 kịch bản Chrome desktop/mobile dùng GLB thật, API có kiểm soát nằm tại [24-web-model-flow-review.md](24-web-model-flow-review.md).

App đã clone vào `D:\FPTU\07\EXE201\Memento3D-FrontEnd-App` và nối cùng hợp đồng API: ảnh có view_hint, polling job thực, scene theo output ID, mũ/tóc loại trừ, kính tùy chọn, lưu JSON/revision, xử lý 409 và URL ký hết hạn.

Mã chính của app nằm trong `lib/features/customization/`; bộ dựng 3D nằm trong `tool/model_viewer/src` và bundle đã được build lại. Hướng dẫn vận hành và phạm vi kiểm chứng nằm tại `D:\FPTU\07\EXE201\Memento3D-FrontEnd-App\docs\WEB-APP-CUSTOMIZATION-PARITY-VI.md`.

Chưa chạy app trên điện thoại/emulator vì máy chưa có Android SDK. Các kiểm tra hiện tại xác nhận source, transport, navigation và renderer logic; chưa xác nhận tích hợp app thật với BE/ngrok/AI.

Đặt in custom còn bước BE snapshot/export bất biến, nên chưa nối thiết kế custom vào checkout cũ. Phần chất lượng ảnh và thuật toán AI giữ ngoài phạm vi theo yêu cầu.
