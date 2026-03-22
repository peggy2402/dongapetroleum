# 📝 Nhật ký Phát triển - Đông Á Petroleum

**Ngày:** 22/03/2026
**Trạng thái:** Năng suất cực cao 🚀

## 🌟 Các tính năng đã hoàn thiện hôm nay

### 1. Quản lý Tài khoản (Administrators)

- Phân tách rõ ràng 2 bảng: **Danh sách Quản trị viên** (Admin) và **Danh sách Nhân viên** (Staff).
- Sửa triệt để lỗi 404 bằng cách đồng bộ chuẩn collection `administrators` trong MongoDB.
- Tạo mã tự động thông minh: `ADM...` cho admin và `STF...` cho staff.

### 2. Quản lý Danh mục (Categories)

- Tối ưu API: Áp dụng `Promise.all` kết hợp `skip/limit` trong MongoDB để **Phân trang** và tăng gấp đôi tốc độ tải.
- Thanh tìm kiếm thời gian thực (Real-time Search) với tính năng **Highlight bôi vàng** từ khóa.
- **Dropdown Autocomplete (Gợi ý thả xuống):** Giải quyết triệt để bài toán Dropdown bị che khuất bởi Modal bằng cách ép nó bật ngược lên trên (`bottom-full`) và cấu hình `z-index` tối đa.
- Sửa lỗi click hụt trong Dropdown: Chuyển từ sự kiện `onClick` sang `onMouseDown` kết hợp `e.preventDefault()` để ngăn ô input bị mất tiêu điểm (`onBlur`).

### 3. Quản lý Sản phẩm (Products) - [Đột phá nhất]

- **Kiến trúc Dữ liệu:** Chuyển đổi tư duy từ việc lưu cứng từng cột thông số sang lưu trữ linh hoạt toàn bộ cấu trúc bảng dưới dạng chuỗi JSON (`specsContent`).
- **Bảng Lưới Động (Dynamic Excel Grid):**
  - Tự tay xây dựng một công cụ vẽ bảng ngay trong React mà không cần dùng thư viện nặng nề.
  - Hỗ trợ thêm cột, thêm hàng, xóa hàng.
  - **Tính năng Lồng cột (Split/Merge):** Cho phép 1 cột chính chia thành nhiều cột con cực kỳ dễ dàng (ví dụ: chia cột Độ nhớt thành 40°C và 100°C).
- **Auto-fill Thông minh (✨ Tải mẫu tự động):** Chỉ bằng 1 cú click, tự động dàn sẵn các template phức tạp của ngành dầu khí:
  - 🛢️ Mẫu Dầu Nhớt chuẩn.
  - ⚙️ Mẫu Mỡ Bôi Trơn cơ bản.
  - 🧪 Mẫu Phức Hợp.
  - ⚙️ Mẫu Mỡ Lithium / Lithium Complex.
  - 🐚 Mẫu Mỡ Shell.
- **Trình soạn thảo văn bản (TinyMCE):** Nhúng thành công cho phần "Nội dung chi tiết" để viết bài chuẩn SEO, bảo mật API Key bằng `.env.local` (`NEXT_PUBLIC_TINYMCE_API_KEY`).
- **UI/UX Tiện ích khác:**
  - Thêm API `POST /api/upload` hỗ trợ upload hình ảnh đại diện vào thư mục `public/uploads`.
  - Lọc sản phẩm theo danh mục cha (Hiển thị chi tiết Tên danh mục con + Tên danh mục cha).
  - Gắn nhãn Badge 🔥 **Nổi bật** và ✨ **Mới** ở cả Form lưu trữ lẫn hiển thị ngoài bảng.
  - Lược bỏ cột "Sắp xếp" dư thừa, ưu tiên sắp xếp sản phẩm mới nhất lên đầu (`createdAt: -1`).

## 💡 Bài học kinh nghiệm (Lessons Learned)

- **CSS Stacking Context:** Cẩn thận với `overflow` và `z-index`. Đôi khi phải thay đổi hướng xuất hiện của component (trượt lên thay vì trượt xuống) để giải quyết xung đột không gian.
- **Event Handling trong React:** Hành động Click cấu thành từ mousedown và mouseup. Khi dùng UI Autocomplete, bắt sự kiện bằng `onMouseDown` sẽ tránh được việc thành phần bị ẩn đi do `onBlur` của input trước khi click được ghi nhận.
- **Tư duy Kiến trúc:** Lắng nghe kỹ Use Case của người dùng thực tế (Nhân viên nhập liệu) quan trọng hơn việc thiết kế Database theo tư duy chuẩn hóa thông thường. Bảng Lưới Động lưu JSON là một minh chứng hoàn hảo cho sự linh hoạt tuyệt đối.

_— Hệ thống quản trị đã bước lên một tầm cao mới! Tiếp theo chúng ta sẽ tiến ra Frontend. —_
