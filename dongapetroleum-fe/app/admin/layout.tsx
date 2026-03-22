"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession, SessionProvider } from "next-auth/react";

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    // Lấy thông tin user và role đang đăng nhập từ Session
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    // Cấu hình danh sách Menu, thêm cờ adminOnly cho những trang nhạy cảm
    const allMenus = [
        { name: "Quản lý Trang (Tabs)", path: "/admin/tabs", icon: "📑" },
        { name: "Quản lý Danh mục", path: "/admin/categories", icon: "📁" },
        { name: "Quản lý Sản phẩm", path: "/admin/products", icon: "🛢️" },
        { name: "Quản lý Khách hàng", path: "/admin/customers", icon: "👥" },
        { name: "Quản lý Chứng chỉ", path: "/admin/certificates", icon: "📜" },
        { name: "Quản lý Đối tác", path: "/admin/partners", icon: "🤝" },
        { name: "Quản lý Tài khoản", path: "/admin/administrators", icon: "👨‍💻", adminOnly: true },
        { name: "Công cụ gửi Email", path: "/admin/email-tool", icon: "✉️" },
    ];

    // Lọc bỏ Menu ẩn đối với nhân viên (Staff)
    const adminMenus = allMenus.filter(menu => {
        if (menu.adminOnly && userRole !== "admin") return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex font-sans">
            {/* Thanh Sidebar (Cột menu bên trái) */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
                <div className="h-16 flex items-center justify-center bg-gray-950 border-b border-gray-800">
                    <span className="text-xl font-bold text-blue-500">ĐA Admin Panel</span>
                </div>
                
                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                    {adminMenus.map((menu) => {
                        const isActive = pathname.startsWith(menu.path);
                        return (
                            <Link 
                                key={menu.path} 
                                href={menu.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? "bg-blue-600 text-white font-medium shadow-md" 
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                                <span>{menu.icon}</span>
                                <span>{menu.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                        <span>🚪</span> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Khu vực hiển thị Nội dung chính (Bên phải) */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-8 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Hệ thống Quản trị Đông Á Petroleum</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                            Xin chào, <strong className="text-blue-600 dark:text-blue-400">{session?.user?.name || "Đang tải..."}</strong> 
                            <span className="text-xs ml-1 opacity-70">({userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên'})</span>
                        </div>
                    </div>
                </header>
                
                {/* Trẻ em (children) chính là các trang page.tsx bên trong thư mục /admin/ */}
                <div className="flex-1 overflow-auto bg-gray-50 dark:bg-zinc-900">{children}</div>
            </main>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SessionProvider>
    );
}