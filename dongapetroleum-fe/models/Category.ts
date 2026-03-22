// Cấu trúc dữ liệu chuẩn hiện đại
export interface Category {
    id: string;
    code: string;           // Mã danh mục
    name: string;           // Tên danh mục
    slug: string;           // URL tùy chỉnh
    description: string;    // Mô tả danh mục
    parentId: string | null;// Danh mục cha (null nếu là danh mục gốc)
    image: string;          // Ảnh đại diện
    order: number;          // Sắp xếp
    status: "active" | "inactive"; // Trạng thái
    
    // Nhóm SEO
    seoTitle: string;       // Tiêu đề SEO
    seoDescription: string; // Mô tả SEO
    seoContent: string;     // Nội dung thẻ H (Hỗ trợ SEO)
}