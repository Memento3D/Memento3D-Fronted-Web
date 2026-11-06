# Rà soát và hoàn thiện luồng web model — 06/11/2026

## Phạm vi và bằng chứng

Đã rà source và chạy Chrome headless tự động ở desktop 1440 px và mobile 390 px. Trình duyệt tải GLB thật từ artifact kiểm chứng và asset local, thực thi WebGL, chọn phụ kiện, gửi request lưu JSON và mở lại. API được chặn/mô phỏng trong phiên kiểm tra để kiểm soát lỗi và tránh gọi AI, tạo user/job hoặc ghi Neon/B2.

Đây là xác nhận hành vi FE với hợp đồng API, **không phải** chứng nhận tích hợp trực tiếp với toàn bộ BE/ngrok/AI đang chạy. Chất lượng ảnh/thuật toán AI được để ngoài phạm vi theo yêu cầu.

## Lỗi đã sửa

| Vấn đề | Hành vi sau sửa |
| --- | --- |
| apiClient chuyển AxiosError thành Error, code custom không nhận được HTTP 409 | Helper đọc status/code từ lỗi đã được bọc; xung đột không còn bị báo như lỗi lưu chung |
| Upload bị gián đoạn phải tạo lại phiên | Khi giữ cùng bộ ảnh trong trang đang mở, dùng lại scan và ID các ảnh đã được xác nhận upload thành công |
| POST tạo job mất phản hồi có nguy cơ gửi trùng khi thử lại | Tìm job hiện có của scan trước khi gửi lại POST; chỉ tạo nếu máy chủ xác nhận chưa có bằng 404 |
| Polling setInterval có thể chồng request hoặc tiếp tục sau rời trang | Poll tuần tự bằng timeout sau mỗi request, bỏ response cũ, thu hồi timer khi đổi trang/job; có timeout HTTP |
| Bấm retry trong progress có thể truyền MouseEvent thay job ID | Wrapper gọi rõ hàm kiểm tra trạng thái, không truyền sự kiện vào ID |
| Lỗi lấy output chưa có hành động phục hồi | Có nút Tải lại mô hình, không yêu cầu tạo lại AI |
| Không phân biệt mất kết nối với job đang xử lý | Sau các lần lỗi liên tiếp có cảnh báo kết nối; không báo ảnh lỗi hoặc tạo job mới |
| Trạng thái/tiến trình SSE cũ che kết quả terminal từ polling | Hoàn tất/thất bại từ API được ưu tiên; hoàn tất hiển thị 100%; khi chưa biết phần trăm không hiển thị giả 0% hoàn thành |
| Hai alert thất bại trùng nhau | Giữ thông báo chi tiết ở trang; progress không lặp lại khi đã có thông báo từ parent |
| Mất thay đổi khi điều hướng hoặc tải lại | Guard điều hướng/Back/Forward/đóng trang; session draft theo output/fit/revision để phục hồi lựa chọn chưa lưu trong tab |
| Browser draft cũ có thể che bản server mới | Nếu revision khác, giữ lựa chọn để đối chiếu nhưng khóa ghi đến khi tải bản lưu; không tự nâng revision của draft cũ |
| Danh sách bị giới hạn 50 mục, khó làm mới | Phân trang 12 mục và nút Làm mới; giữ lỗi/empty/loading riêng |
| Lỗi tải lại scene có thể tiếp tục hiện dữ liệu cũ | Reset dữ liệu tải và có retry; không quy mọi 409 thành output legacy |
| Camera báo đã thêm ảnh dù file bị từ chối | Chỉ báo thành công nếu ảnh thật sự được thêm |
| Mobile phải cuộn qua tám bước đã hoàn tất | Thu gọn phần chi tiết công đoạn khi xong; có thể mở lại |
| Khó quan sát phụ kiện trên toàn thân | Thêm Xem gần khuôn mặt / Xem toàn thân |
| Rời viewer vẫn tải GLB nền | Abort các download đang chờ khi unmount, giữ cleanup GPU/texture |

Session draft chỉ là lựa chọn JSON tạm trong tab, không lưu signed URL hoặc model mới. Chỉ nút Lưu thiết kế mới gửi PUT tới tài khoản. Resume upload hiện áp dụng khi trang vẫn mở; chưa phục hồi file upload sau khi đóng tab hoặc reload.

## Kịch bản trình duyệt đã đạt

1. Tạo model yêu cầu đủ ba góc và consent; upload lỗi giữa chừng, retry dùng cùng scan và không gửi lại ảnh front đã được xác nhận; chuyển từ tiến trình sang scene.
2. WebGL tải base/phụ kiện thật; chọn tóc/kính, lưu đầy đủ JSON và revision, mở lại đúng lựa chọn.
3. HTTP 409 giữ lựa chọn local, khóa lưu và chỉ phục hồi bản server khi người dùng chọn.
4. Cảnh báo điều hướng khi còn thay đổi; Back không làm mất bản đang chỉnh, có phục hồi draft trong tab.
5. Job thất bại hiện THẤT BẠI, không còn nhãn ĐANG XỬ LÝ.
6. GET scene lỗi mạng có thể phục hồi bằng nút Thử lại.
7. Điều khiển camera xem mặt/toàn thân hoạt động.
8. Mobile 390 px không tràn ngang; panel xuống dưới viewer.
9. Danh sách model có thể chuyển trang.
10. URL GLB nhận 403 được lấy scene/URL mới và retry một lần.
11. Asset nhận 500 được rollback lựa chọn, rồi chọn lại có thể tải thành công.
12. Scene chỉ xem không cho đổi asset hoặc lưu.

Không có pageerror JavaScript trong lượt đạt. Script và ảnh chụp được giữ ở `scripts/web-flow-review-20261106/` (thư mục scripts được gitignore). Không đưa artifact GLB/ảnh người dùng vào git.

## Phần còn thiếu để hoàn chỉnh nghiệp vụ

- **Chốt custom để đặt in:** BE cần snapshot bất biến theo order item, gồm base output/fit và asset version. Web gửi định danh thiết kế, không gửi URL/matrix tùy ý làm nguồn sự thật.
- **Xuất file và duyệt:** export model đã ghép từ snapshot, kiểm tra file in, liên kết model version thật với đơn/print job; preview thành công không đồng nghĩa in được.
- **Đơn hàng/thanh toán:** chỉ mở CTA đặt sản xuất custom khi hai bước trên có hợp đồng và trạng thái rõ ràng. Hiện web thông báo chức năng lưu, không giả vờ gửi thiết kế custom đi in.
- **Tích hợp thật:** còn cần một phiên đăng nhập/job mới qua BE để xác nhận CORS B2, dữ liệu scene và lưu Neon với cấu hình môi trường thực. Lượt kiểm tra UI này không thay thế bước đó.
- **Mở rộng:** ảnh thumbnail riêng của thiết kế đã lưu, phục hồi upload sau đóng tab và cập nhật danh sách realtime có thể bổ sung sau; hiện dùng phân trang/làm mới thủ công.

Luồng web model đã đủ cho tạo → xem tiến trình → tùy chỉnh → lưu → mở lại theo API hiện có. Luồng custom → thanh toán → in chưa được đánh dấu hoàn thành.
