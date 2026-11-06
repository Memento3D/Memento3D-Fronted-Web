# Kết quả vòng sửa và đánh giá tổng thể 04/07

## Thay đổi source AI

- Thêm `tools/headapi/stable_optimizer.py`, policy `rdf_objective_acceptance_v1`; worker dùng policy này. Vendor, model weights, identity và asset/profile pins giữ nguyên.
- Pose và shape/identity fitting có backtracking, tăng damping khi bước không giảm objective, giữ trạng thái trước khi không tìm được bước hợp lệ. Objective có residual và regularization; kiểm tra hình học hữu hạn và suy biến trước khi giữ nghiệm.
- Camera được tìm độc lập cho từng ảnh, đánh giá nhiều ứng viên trong khoảng policy hiện có. Lưu chính nghiệm tốt nhất đã đánh giá; refinement chỉ thay nghiệm nếu objective chung tốt hơn. Không cố định FOV của 04 cho 07. Camera tại biên được ghi audit.
- Bỏ ép `CUDA_LAUNCH_BLOCKING` ở service; đây không phải cách chữa đã được chứng minh.
- Phân loại lỗi worker RDF thành thiếu VRAM, ảnh bị gate từ chối, hoặc fit không đạt. Giữ các gate hình học/ảnh hiện có; không biến mọi lỗi nội bộ thành yêu cầu thay ảnh.
- Fitter kính dùng `bounded_lateral_search_v1`: thay bốn bước uốn càng cố định bằng tìm clearance đo được trong cùng giới hạn 8 mm. Không sửa vị trí gọng trước và không nới ngưỡng chặn lấn mặt -1 mm.

## Kết quả

| Hạng mục | 04 | 07 |
| --- | --- | --- |
| RDF | FIT_GATES_PASSED | FIT_GATES_PASSED |
| Thời gian RDF | 18,77 s | 11,64 s |
| Texture và ghép body | UV_SCENE_EXPORTED | UV_SCENE_EXPORTED |
| Vòng pipeline đánh giá | MVP_EXPORTED, 109,33 s | PARTIAL, 95,23 s, bị chặn ở kính |
| Fitter custom sau sửa càng kính | 3 asset đạt kiểm tra hiện có | 3 asset đạt kiểm tra hiện có |
| Điểm gọng lấn quá 1 mm theo sampling | 0 | 0 |
| Khoảng hở mẫu nhỏ nhất | khoảng 0,623 mm | khoảng 0,035 mm |
| Các lần cập nhật objective được kiểm tra | 40, đều không tăng | 42, đều không tăng |

Điểm mới tìm thấy trong vòng đầy đủ: 07 đã vượt RDF và body nhưng hai đỉnh trùng vị trí trên càng kính còn khoảng -1,030 mm sau heuristic cũ. Đây là lỗi khác với RDF. Sau khi sửa fitter, chạy lại **riêng custom cho cả hai base đã tạo** đều đạt. Không sửa lịch sử job 07 từ PARTIAL sang hoàn tất, không chạy lại toàn pipeline sau thay đổi càng kính. Báo cáo và manifest cuối tách riêng để giữ provenance.

Một lần đầu bị chặn bởi lỗi tên biến `locals` trong đoạn ghi audit mới thêm; đã sửa và chạy lại vòng đánh giá. Không tính lần đó là kết quả đạt.

## Ảnh đầu vào và camera

Đã đo cả 6 ảnh: kích thước mặt, khoảng mắt, landmark, độ nét Laplacian, tỷ lệ vùng tối/sáng và sự có mặt của EXIF tiêu cự. Cả hai bộ đều 1280×720 và không có EXIF tiêu cự. Vì vậy chưa có bằng chứng đánh giá nhiều thiết bị thực tế.

Ảnh 07 không có mặt nhỏ hơn 04; số đo không ủng hộ việc quy lỗi fit cũ cho ảnh quá nhỏ. Chỉ số độ nét/ánh sáng là chẩn đoán, chưa dùng ngưỡng từ chối mới chưa hiệu chuẩn. Các gate hiện có vẫn kiểm tra mặt đủ kích thước, mơ hồ nhiều người, ROI rõ ràng và alignment.

Camera từng ảnh độc lập nhưng khoảng tìm vẫn là 20–60 độ theo cấu hình RDF. Cả ba góc 04 và hai góc 07 chọn sát biên dưới: phải coi đây là giới hạn cần nghiên cứu camera tiếp, không gọi là hiệu chuẩn thiết bị. Không mở rộng khoảng hoặc ép FOV chỉ để làm hai mẫu đẹp hơn.

## Body, asset và chất lượng thị giác

Report assembly của cả hai xác nhận không chứa đầu cũ và giữ hình dạng ngoài cổ theo phép similarity. Đây là bằng chứng cấu trúc/provenance, không phải chứng nhận độ giống người.

Đã xem ảnh đầu bốn góc của cả hai. Đầu không suy biến như lỗi trước; ảnh cũng cho thấy vùng không được quan sát, rìa texture và cổ vẫn cần hoàn thiện. Preset body/neck, appearance completion và giới hạn asset vẫn là phạm vi MVP. Không xác nhận đã kiểm tra thị giác toàn bộ tổ hợp kính/tóc/mũ trên web; fitter chỉ có đo khoảng hở mẫu, không phải collision audit toàn mesh.

Kiểm tra bổ sung: 3 kiểm tra backtracking/rollback/nonfinite đạt; architecture boundaries đạt; hash base/asset GLB, header GLB và ma trận custom cuối hợp lệ. Không chạy toàn bộ test suite, không publish lên B2/Neon, không thay job BE.

## Artifact để xem lại

Trong repo AI:

```
validation/customization/rdf-objective-acceptance-v1-final/index.html
validation/customization/rdf-objective-acceptance-v1-final/overall-assessment.json
validation/customization/rdf-objective-acceptance-v1-final/photo-assessment.json
validation/customization/rdf-objective-acceptance-v1-final/accessories-final-assessment.json
validation/customization/rdf-objective-acceptance-v1-final/accessories-final-04/manifest.json
validation/customization/rdf-objective-acceptance-v1-final/accessories-final-07/manifest.json
```

Base 04: `jobs/b6dc1371-9615-4158-b56f-e9187835ac75/render/scene.glb`.

Base 07: `jobs/06b2bf3a-40ea-4f19-bc7a-e7e97f520ef3/render/scene.glb`.

## Đánh giá chốt

Đã sửa cơ chế cập nhật gây phân kỳ và giới hạn bốn bước của fitter kính, có kết quả trên cả hai bộ thực tế, giữ nguyên gate. Đủ cơ sở tiếp tục kiểm tra tích hợp MVP với source mới; **chưa đủ cơ sở cam kết mọi ảnh, mọi camera/góc chụp đều thành công hoặc in được**.

Restart AI bằng `START-HEADAPI-CUSTOMIZATION-BASE.ps1 -Port 8090` trước job mới để nhận service và policy đã sửa. Không đổi key, URL ngrok hay catalog asset chỉ vì thay đổi này. Job cũ không được sửa thành kết quả mới.
