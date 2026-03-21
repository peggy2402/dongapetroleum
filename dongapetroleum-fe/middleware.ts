export { default } from "next-auth/middleware";

// Chỉ định những đường dẫn (routes) nào cần được bảo vệ
export const config = {
    // Dấu * có nghĩa là bảo vệ trang /admin và TẤT CẢ các trang con bên trong nó (vd: /admin/tabs, /admin/email-tool)
    matcher: ["/admin/:path*"],
};