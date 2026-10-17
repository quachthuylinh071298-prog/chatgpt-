# Kiến trúc MVP

## Thành phần

```text
Trình duyệt (Next.js / React / TypeScript, CSS responsive)
        │ cookie HMAC + kiểm tra Origin
        ▼
Next API route (Node runtime, Zod validation)
        ├── SQLite WAL: projects / observations / imports / content / audit
        └── jobs: queued → running → done hoặc failed
                         │ worker process (một instance)
                         ▼
          snapshot hồ sơ + dữ liệu trong phạm vi
                         │
            kiểm tra fingerprint SHA-256
                         │
          connector logs + engine quy tắc sáu bước
                         ├── AIProvider (tùy chọn): aggregates + budget
                         ▼
           reports: JSON bất biến, version tăng dần
                         │
            Compare / ExcelJS export / Print CSS
```

SQLite được chọn thay PostgreSQL vì môi trường chưa có database service. `node:sqlite` cần Node >=22.13, không có binary addon bổ sung. Schema nằm trong `lib/db.ts`; `docs/schema.sql` là bản tham chiếu. Bảng `projects.payload` và `reports.payload` lưu schema JSON TypeScript. Không chạy migration PostgreSQL giả. Đổi sang PostgreSQL cần repository adapter, migration có phiên bản và queue leasing; không chỉ thay chuỗi kết nối.

## Hợp đồng dữ liệu

- `project_id + date` là khóa số liệu tổng hợp. Khi thay thế ngày, thay toàn bộ dòng, không cộng chồng.
- Import là transaction. Không lưu file gốc hoặc dữ liệu định danh. Nhập liệu có xác nhận người dùng và whitelist cột; không thể phát hiện mọi PII cố tình nhập vào ô văn bản dự án. Vì vậy AI mặc định không nhận bất cứ văn bản tự do nào.
- Mỗi report chụp `project`, `rows`, `metrics`, phạm vi ngày, source logs, sáu section và AI status. Không có API sửa/xóa report. Số phiên bản unique theo project.
- Tỷ lệ dùng giao của ngày có đủ tử/mẫu; số tổng dùng từng cột có dữ liệu, không suy diễn null. Việc so sánh khác độ phủ dữ liệu có thể gây hiểu sai: UI luôn hiện số ngày và phạm vi, không khẳng định causal uplift.
- Coverage = tỷ lệ dòng nhật ký có dữ liệu người dùng hoặc bản lưu biên soạn; bản lưu không được coi là vừa thu thập. Chỉ số này thể hiện độ phủ nội dung trong nhật ký, không phải tỷ lệ thị trường được khảo sát hoặc tỷ lệ bằng chứng được xác minh.
- Fingerprint gồm hồ sơ, rows, phạm vi, sources, useAI. Cùng fingerprint với phiên bản gần nhất bị từ chối. Không tự xóa queue, không tự retry lỗi gây phí AI.

## Tác vụ và khả năng phục hồi

API thêm hàng đợi rồi trả 202; UI polling mỗi 2,5 giây khi có queued/running. Worker claim bằng `BEGIN IMMEDIATE`; index partial giới hạn một active job/project. Timeout API AI 60 giây. Worker phát hiện running quá 5 phút và đánh dấu failed. Giữ giao dịch ngắn; không giữ transaction trong lúc gọi AI. Chạy một worker trong MVP, chưa có distributed leases. Lỗi hoặc restart giữa các bước không ghi đè report cũ; lưu report và cập nhật job done trong cùng transaction.

## An toàn và giới hạn

Một không gian chung, một mật khẩu quản trị; chưa có tenant hoặc quyền người dùng. Cookie HttpOnly, SameSite Strict, Secure trên HTTPS. Session HMAC gồm expiry/nonce; kiểm tra Origin và Fetch Metadata trên mọi mutation; khi qua proxy, nhận diện cùng nguồn theo địa chỉ trình duyệt, không chỉ Host nội bộ. Không có OAuth giả. API từ chối trước khi seed/read/write nếu chưa đăng nhập. Các bí mật nằm trong `.env.local`, không trả qua API. Rate limit login trong bộ nhớ toàn tài khoản (8 lần/15 phút), reset khi restart: cần proxy rate limit và account identities ở production nhiều người.

Upload tối đa 5 MB, 10.000 dòng, whitelist cột, từ chối công thức Excel. Chưa phải parser sandbox trước ZIP bomb: triển khai hạn chế người dùng và chỉ nhập file tin cậy; mở rộng phải parse trong process có memory/time limit, giới hạn kích thước giải nén. PDF/DOCX chưa hỗ trợ. Dữ liệu lưu trên filesystem, chưa mã hóa và backup tự động.

Kết quả AI luôn là giả định, không có browsing, không được nâng nhãn thành bằng chứng xác minh. Connector hiện tại cho web/Meta chỉ trả lỗi cấu hình có hướng nhập thay thế. Không yêu cầu cookie Facebook, không thu thập dữ liệu đối thủ riêng tư. URL liên kết HTTP/HTTPS được kiểm tra; UI không render HTML từ AI.

## Lộ trình thực hiện tiếp

1. Thêm nhà cung cấp search có URL/time/evidence thật, tách evidence claim khỏi văn bản AI.
2. Meta OAuth với quyền được duyệt và mapper dữ liệu xuất Meta; không dùng cookie/password.
3. PostgreSQL migrations + repository abstraction, auth tổ chức, RBAC và audit actor.
4. Worker leases, retry có kiểm soát, sandbox parser, object storage tài liệu và pipeline extraction.
5. Tạo nội dung chuyên biệt dựa trên bằng chứng, biên tập/duyệt bác sĩ và theo dõi baseline/attribution.
