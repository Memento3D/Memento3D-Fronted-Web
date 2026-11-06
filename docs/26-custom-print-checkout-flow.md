# Đặt sản xuất thiết kế custom — 06/11/2026

Phạm vi đã mở rộng theo quyết định: nối BE + web đặt in custom trước, sau đó đồng bộ app. Thay thế giới hạn preview/save ở tài liệu 25; phần thuật toán tái tạo ảnh vẫn để riêng.

## Luồng đã nối

1. User tạo model, chọn mũ hoặc tóc, có thể thêm kính, bấm **Lưu thiết kế**.
2. **Đặt sản xuất bản đã lưu** chỉ bật khi không còn thay đổi chưa lưu, viewer tải thành công và không xung đột revision.
3. User xác nhận bản lưu, thông tin nhận hàng và chiều cao mong muốn 8–20 cm. Đây là yêu cầu xưởng báo giá, chưa thu tiền.
4. BE khóa bản lưu theo output/fit/revision trong cùng transaction tạo đơn. Bản trong đơn giữ ID asset, hash, vị trí và storage reference, không trỏ lại vào draft đang sửa.
5. Worker ghép GLB từ đúng các file/hash đã chốt, đặt asset bằng ma trận một lần, giữ nguyên mesh/texture và scale đồng đều toàn mẫu theo chiều cao yêu cầu. File hoàn chỉnh lên B2 bằng key riêng theo design ID của đơn.
6. Khách và xưởng xem cùng bản chốt trong chi tiết đơn. Đổi draft cá nhân không làm thay đổi đơn.
7. Xưởng kiểm tra file, ghi nhận xét và duyệt, rồi gửi báo giá. Khách đồng ý báo giá mới được thanh toán.
8. Đơn đã thanh toán và ở `PROCESSING` mới tạo Print Job custom, gắn đúng order item và model version của file trong đơn.

Retry checkout giữ nguyên payload và idempotency key, kể cả khôi phục yêu cầu đang chờ trong tab/app. BE ưu tiên custom checkout khi có `modelOutputId`; không lấy nhầm sản phẩm trong giỏ và không xóa giỏ. Giá custom do xưởng xác nhận, không dùng giá tự tính trên FE.

## UI

- Workspace: nút Lưu và nút Đặt sản xuất riêng; yêu cầu lưu trước khi chốt.
- Hộp thoại đặt sản xuất: tên phụ kiện đã chọn, số bản lưu, địa chỉ/điện thoại, chiều cao, xác nhận và trạng thái gửi lại cùng yêu cầu.
- Chi tiết đơn: panel **Thiết kế đã chốt trong đơn**, trạng thái xuất/duyệt, tên asset, chiều cao, mở viewer và tải GLB. Không điều hướng sang draft cá nhân khi người dùng đang muốn xem mẫu trong đơn.
- Manager: panel duyệt file yêu cầu xác nhận đã kiểm tra hình học/độ khít/kích thước/khả năng sản xuất và ghi chú. Báo giá/tạo Print Job chờ file được duyệt; BE cũng kiểm tra các điều kiện này.
- App: cùng bước gửi bản lưu, khôi phục yêu cầu đang chờ, xem file của đơn và đồng ý báo giá. VNPAY dùng endpoint riêng; WebView quay lại sau BE verify và app đọc lại trạng thái đơn.

## Lưu trữ

- Neon: `order_custom_designs` giữ snapshot JSON bất biến, revision, fingerprint, trạng thái export/review, reference B2 và model version. Trigger DB chặn sửa nội dung bản chốt, order/item/output và chiều cao.
- B2: file GLB hoàn chỉnh tại nhánh `.../customization/order-{designId}.glb`, tách khỏi base và catalog. URL ký được cấp mới khi đọc chi tiết, không lưu URL ký trong snapshot.
- Cloudinary: thumbnail dùng để chọn asset như trước.

Worker có scheduler riêng, claim có lease, tự thu hồi export đang chạy quá 20 phút khi process bị ngắt. Lỗi export giữ nguyên snapshot; người dùng có thể thử xuất lại từ chính bản đó. Không gọi lại AI cho mỗi lần chọn asset hoặc đặt in.

## Kiểm chứng đã thực hiện

- V30 đã migrate trên Neon; xác nhận trigger bất biến tồn tại.
- BE build Docker thành công; backend và Redis đã khởi động, backend healthy ở 8080; Swagger có GET custom-design và POST retry/review.
- Test có trọng tâm: khóa revision, snapshot giữ lựa chọn cũ khi draft đổi, custom checkout không tiêu thụ giỏ/không nhận giá client, chặn thanh toán/sản xuất trước điều kiện.
- Ghép GLB local thật: body/đầu với tóc+kính và mũ+kính. Kiểm tra dữ liệu base giữ nguyên; file được tạo tại `BE/target/custom-print-validation/`.
- Chrome thực thi WebGL trên GLB ghép: checkout, mất phản hồi rồi gửi lại cùng key, xem file trong đơn, mobile 390 px không tràn ngang, xưởng duyệt và báo giá, khách chấp thuận. API trình duyệt được mô phỏng có kiểm soát; bằng chứng local ở `scripts/custom-print-web-review/`.
- App có kiểm tra transport/điều hướng: retry cùng payload, chặn thanh toán trước khi đồng ý báo giá và gọi VNPAY không gửi số tiền từ client. Chưa chạy app trên Android/iOS thật vì thiếu Android SDK/emulator.

## Giới hạn cần giữ rõ

GLB xuất ra là model đủ thành phần, đúng tỷ lệ và giữ texture. Ghép scene không tự hàn khối, sửa lưới kín hay tạo support/file GOO/CTB. Đây là lý do phải có bước xưởng kiểm tra trước khi duyệt sản xuất.

glTF dùng mét; 12 cm tương ứng 0.12 m. Khi chuẩn bị STL/slicer phải xác nhận đơn vị mm và hướng trục, không đổi đuôi `.glb` thành `.stl`. Nhánh resin custom giữ URL STL trống nếu chưa có file thật và yêu cầu hash cho file slice thật.

Lượt kiểm tra này không tạo đơn thật, upload artifact đơn mới lên B2 hoặc thanh toán thật. Chưa xác nhận một lượt end-to-end có đăng nhập thật qua AI/ngrok → BE → B2 → thanh toán sandbox; không thay thế kiểm tra kỹ thuật trước khi in vật lý.
