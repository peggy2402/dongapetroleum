import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/admin/components/LogoutButton";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Lấy thông tin đăng nhập từ Server
    const session = await getServerSession(authOptions);

    // Dự phòng thêm 1 lớp bảo vệ: Nếu chưa đăng nhập thì đẩy ra ngoài
    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col font-sans">
            {/* Thanh Header dùng chung cho mọi trang Admin */}
            <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <span className="font-bold text-gray-800 dark:text-white text-lg">Admin Panel</span>
                        <nav className="hidden md:flex gap-4">
                            <Link href="/admin/tabs" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300">Quản trị nội dung</Link>
                            <Link href="/admin/email-tool" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300">Gửi Email</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline-block">Xin chào, <strong className="text-blue-600 dark:text-blue-400">{session.user?.name}</strong></span>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>
        </div>
    );
}