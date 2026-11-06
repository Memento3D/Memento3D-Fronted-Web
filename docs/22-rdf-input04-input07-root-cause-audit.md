# Rà soát RDF: input 04 thành công, input 07 thất bại

## Kết luận có bằng chứng

Lỗi của job 07 `40f0ab00-79b9-45b2-8b8f-79f54ee11782` xảy ra trong RDF trước texture, body và fitting phụ kiện. Không phải lỗi kính hay B2. CUDA đồng bộ vẫn bật trong job thất bại này, vì vậy thay đổi đó chưa sửa được nguyên nhân.

| Quan sát | 07: 40f0ab00 | 04: ebf5546c |
| --- | --- | --- |
| Trạng thái | FAILED ở 02_rdf_fit | MVP_EXPORTED |
| Thời gian AI từ started đến finished | khoảng 20,3 giây | khoảng 154,8 giây |
| VRAM peak allocated / reserved | khoảng 1,69 / 2,06 GiB | khoảng 1,69 / 2,06 GiB |
| CUDA_LAUNCH_BLOCKING | true | true |
| Mesh tại kiểm tra mắt | Z khoảng -59.741.852; mắt có chiều Z bằng 0 | tọa độ khoảng -0,19 đến 0,24 |
| Nguyên nhân trực tiếp | Fit phân kỳ, mất độ chính xác float32 khi dịch chuyển quá lớn, mesh suy biến | Nghiệm cuối vượt các gate đang có |

Ở job 07, số đo mắt extent `[0.03125, 0.046875, 0.0]` không có nghĩa ảnh người đó có mắt bất thường. Đó là hình học đã hỏng sau tối ưu. Gate đã chặn output hỏng đúng chức năng; không nên nới hoặc xóa gate để ép thành công.

Việc giao diện từng chờ nhiều phút không đồng nghĩa RDF đã tính nhiều phút. Các job xếp hàng/kẹt chưa bắt đầu, quá trình BE đồng bộ và log HTTP là những mốc khác nhau. Job 07 được đối chiếu ở đây đã thất bại sau khoảng 20 giây trên AI.

## Khoanh vùng thuật toán

Trong vendor `tracker/fitting/gn_flame_optimizer.py`:

- `_register_pose` cộng trực tiếp `delta` vào pose/translation.
- `_register` cộng trực tiếp bước giải vào `x` và `identity`, với damping cố định; không có điều kiện chấp nhận bước theo giảm objective hoặc rollback nghiệm tốt nhất trong các vòng này.
- `_register_wi_fov_search` dùng golden-section trên khoảng cấu hình 20–60 độ, với các ứng viên phải chạy lại pose/shape fitting. Objective thực tế có ứng viên phân kỳ, không phải một hàm trơn ổn định đã được xác minh unimodal.
- Sau tìm kiếm, code lấy trung điểm khoảng còn lại và fit lại, thay vì giữ chính nghiệm hợp lệ có objective tốt nhất đã đo. Không có kiểm tra hình học để loại ứng viên phân kỳ ngay tại search.

Đối chiếu cache của đúng hai job, không tái tạo prediction, body hay API:

- Trace 07 ghi nhận ngay lần `_register` đầu tiên có identity cỡ `10^14`, state cỡ `10^19`.
- Trace 04 cũng có ứng viên `_register_pose` bị translation tới khoảng -17.665.824. Thành công của 04 là thành công ở nghiệm cuối, không phải mọi ứng viên ổn định.
- Trong trace 07: FOV 35,28 độ cho energy khoảng 267; 44,72 độ khoảng 17.459; các FOV 24,98–29,44 độ cho khoảng 0,031–0,032. Một lần trace cuối đã vượt gate, trong khi job gốc thất bại. Điều này chứng minh tính nhạy/không ổn định của đường giải hiện tại; không chứng minh FOV thấp cố định là lời giải tổng quát.
- Chưa chứng minh được thành phần gây nhiễu số chính xác trong CUDA/solver. Không kết luận tất cả là race CUDA, không cam kết chỉ đặt seed hay launch blocking sẽ sửa triệt để.

Artifact điều tra trong repo AI:

```
validation/customization/rootcause-trace-40f0ab00/report.json
validation/customization/rootcause-trace-40f0ab00/optimizer-trace.json
validation/customization/rootcause-trace-ebf5546c/report.json
validation/customization/rootcause-trace-ebf5546c/optimizer-trace.json
```

Các artifact này chỉ là chẩn đoán. Không thay output, trạng thái hay provenance của job API gốc.

## Có fix cứng theo mẫu không?

Không tìm thấy nhánh chọn input/04 hoặc input/07 trong `tools/headapi/rdf_worker.py`. Worker dùng ảnh/crop/prediction của từng job. `fixed_fov` và `warm_fit` là tùy chọn thử nghiệm; service API hiện không truyền chúng. Không lấy identity từ job 04 để fit job 07.

Tuy nhiên pipeline có các giả định cố định cần phân biệt:

1. RDF dùng crop 1024, ROI chính diện dựa landmark, optimizer FLAME 100 expressions, 20 vòng riêng từng view, 10 vòng joint; camera tìm trong 20–60 độ. Đây là policy/giới hạn kỹ thuật, chưa được hiệu chuẩn cho mọi input.
2. `eye_components.identify` chỉ chấp nhận topology FLAME ba component `[3931,546,546]`, có ngưỡng tỷ lệ mắt. Đây là guard có giới hạn, không phải bằng chứng tất cả các khuôn mặt phải đáp ứng policy hiện tại.
3. Assembly có tham chiếu thật tới asset thử nghiệm: template body, reference_bundle, reference_pose, embedding có đường dẫn input04, hair_library có đường dẫn input07. Worker assembly đọc embedding là chỉ số tam giác/trọng số barycentric, không lấy texture mặt 04; đọc reference head/pose để căn mắt và fit đầu mới. Các tham chiếu này ràng buộc preset body và còn là nợ đóng gói; chúng không được đọc trong bước RDF đang lỗi.
4. `assembly_math` còn giới hạn tỷ lệ đầu/preset 0,7–1,4, tóc 0,65–1,5 và các mốc cổ theo preset. Đây có thể gây lỗi/khuyết điểm ở giai đoạn sau với người khác, cần đánh giá riêng sau khi RDF ổn định. Không nên quảng bá là đã tổng quát hóa.

RDF độc lập xuất được mesh và pipeline tích hợp chấp nhận mesh là hai điều kiện khác nhau. Muốn so sánh công bằng phải giữ cùng ảnh, ROI/crop, config/model, camera và kiểm tra hình học, thay vì so một file mesh tồn tại với một job bị gate chặn.

## Hướng sửa có cơ sở

1. Tách policy RDF ổn định khỏi preset body; giữ per-job identity và provenance. Không thay ảnh 07 bằng identity, camera hoặc đầu mẫu 04.
2. Bổ sung acceptance/rollback cho bước tối ưu theo objective phù hợp với phase và điều kiện hình học/camera hữu hạn. Damping thích nghi khi bước làm xấu nghiệm; dừng với lỗi numerical divergence rõ ràng khi không còn bước hợp lệ. Không clamp mesh sau khi đã phân kỳ.
3. Search camera cần bỏ ứng viên không hợp lệ, lưu nghiệm tốt nhất đã kiểm chứng và dùng nghiệm đó cho refinement. Không áp FOV của một người lên mọi người. Không giả định golden-section ổn khi objective chưa đáp ứng điều kiện.
4. Kiểm chứng thay đổi trên cùng cache 04 và 07, gồm số đo độ hội tụ và gate, rồi mới chạy pipeline đầy đủ cho cả hai. Một lần vượt gate không đủ để tuyên bố ổn định hoặc chất lượng thị giác đã đạt.
5. Sau đó mới chuyển tham chiếu body/pose ra package asset độc lập có metadata, loại phụ thuộc thư mục runs; giữ compatibility và giới hạn preset rõ ràng.

Lần rà soát này không thay ngưỡng, không áp thuật toán camera mới, không sửa model weights hay ghi lại job đã thất bại. Kết quả hiện tại là khoanh vùng lỗi fit và các giả định preset, chưa phải xác nhận sửa xong.
