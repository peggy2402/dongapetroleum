export interface Administrator {
    id: string;
    code: string;                  // Mã tài khoản (VD: ADM001, STF001)
    username: string;              // Tên đăng nhập
    password?: string;             // Mật khẩu (Lưu ý: Không gửi mật khẩu mã hóa về Frontend khi lấy danh sách)
    email: string;                 // Email
    phone: string;                 // Số điện thoại
    address: string;               // Địa chỉ
    role: "admin" | "staff";       // Phân quyền (Quản trị viên hoặc Nhân viên)
    status: "active" | "inactive"; // Trạng thái hoạt động
    createdAt?: Date;
    updatedAt?: Date;
}