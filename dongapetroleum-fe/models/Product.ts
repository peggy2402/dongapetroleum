export interface Product {
    id: string;
    code: string;           // Mã sản phẩm (VD: PRD12345)
    name: string;           // Tên sản phẩm
    slug: string;           // URL tùy chỉnh
    categoryId: string;     // ID của Danh mục chứa sản phẩm này
    image: string;          // Ảnh đại diện
    description: string;    // Mô tả ngắn
    content: string;        // Nội dung chi tiết (Bài viết giới thiệu SP)
    order: number;          // Sắp xếp
    status: "active" | "inactive"; // Trạng thái
    
    // Thông số kỹ thuật chuyên ngành Dầu Khí
    specificGravity: string; // Trọng lượng riêng
    pourPoint: string;       // Điểm đổ
    flashPoint: string;      // Điểm sáng / chớp cháy
    viscosity40: string;     // Độ nhớt 40
    viscosity100: string;    // Độ nhớt 100
    viscosityIndex: string;  // Chỉ số nhớt
    viscosityGrade: string;  // Cấp độ nhớt

    // Tài liệu đính kèm
    msds: string;            // Link tải MSDS
    pds: string;             // Link tải PDS

    // Thống kê & Phân loại
    tags: string;            // Tag (ngăn cách bằng dấu phẩy)
    viewCount?: number;      // Lượt xem
    orderCount?: number;     // Lượt đặt mua

    // Nhóm SEO
    seoTitle: string;
    seoDescription: string;
}