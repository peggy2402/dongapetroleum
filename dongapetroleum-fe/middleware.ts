import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // NẾU LÀ NHÂN VIÊN (STAFF) MÀ CỐ TÌNH GÕ LINK VÀO TRANG QUẢN LÝ TÀI KHOẢN
    // -> ĐÁ VĂNG RA TRANG QUẢN LÝ DANH MỤC
    if (path.startsWith("/admin/administrators") && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/categories", req.url));
    }
});

export const config = {
    matcher: ["/admin/:path*"],
};