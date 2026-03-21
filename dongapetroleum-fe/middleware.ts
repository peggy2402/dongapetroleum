import { withAuth } from "next-auth/middleware";

// Khai báo hàm rõ ràng để trình biên dịch của Next.js (Turbopack) có thể nhận diện
export default withAuth(function middleware(req) {
});

export const config = {
    matcher: ["/admin/:path*"],
};