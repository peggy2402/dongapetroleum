"use client";

import { useState, useEffect } from "react";
import { Administrator } from "@/models/Administrator";
import { useSession } from "next-auth/react";

export default function AdminAdministrators() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const [admins, setAdmins] = useState<Administrator[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Phân loại rạch ròi 2 danh sách
    const adminList = admins.filter(a => a.role?.toLowerCase() === 'admin');
    const staffList = admins.filter(a => a.role?.toLowerCase() === 'staff');

    const generateCode = (role: string) => {
        const prefix = role === "admin" ? "ADM" : "STF";
        return prefix + Math.floor(10000 + Math.random() * 90000);
    };

    // State chứa toàn bộ dữ liệu form
    const [formData, setFormData] = useState({
        id: "",
        code: "",
        username: "",
        password: "", // Sẽ để trống khi Sửa nếu không muốn đổi mật khẩu
        email: "",
        phone: "",
        address: "",
        role: "staff", // Mặc định tạo tài khoản là staff cho an toàn
        status: "active"
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            // Tạm thời fetch sẽ lỗi 404 cho đến khi chúng ta tạo API Route
            const res = await fetch("/api/administrators", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                console.log("🛠️ Dữ liệu API trả về Trình duyệt:", data); // Bật F12 Console sẽ thấy
                setAdmins(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách tài khoản:", error);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            id: "",
            code: generateCode("staff"),
            username: "",
            password: "",
            email: "",
            phone: "",
            address: "",
            role: "staff",
            status: "active"
        });
        setIsModalOpen(true);
    };

    const handleEdit = (admin: Administrator) => {
        setFormData({
            id: admin.id,
            code: admin.code || "",
            username: admin.username || "",
            password: "", // Reset pass trên UI, chỉ gửi đi nếu người dùng nhập pass mới
            email: admin.email || "",
            phone: admin.phone || "",
            address: admin.address || "",
            role: admin.role || "staff",
            status: admin.status || "active"
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = formData.id ? `/api/administrators/${formData.id}` : "/api/administrators";
            const method = formData.id ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                fetchAdmins(); // Làm mới bảng
            } else {
                // Kiểm tra xem phản hồi có phải là JSON không trước khi parse để tránh crash
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await res.json();
                    alert("Lỗi: " + errorData.message);
                } else {
                    alert(`Lỗi hệ thống: ${res.status} ${res.statusText}. Vui lòng thử khởi động lại server (npm run dev).`);
                }
            }
        } catch (error) {
            console.error("Lỗi khi lưu tài khoản:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.")) {
            try {
                const res = await fetch(`/api/administrators/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    fetchAdmins();
                } else {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        alert("Lỗi: " + errorData.message);
                    } else {
                        alert(`Lỗi hệ thống: ${res.status} ${res.statusText}. Vui lòng thử khởi động lại server.`);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi xóa tài khoản:", error);
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-zinc-900 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý Tài khoản</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Thêm, sửa, xóa Quản trị viên và Nhân viên hệ thống.</p>
                </div>
                <button 
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Thêm tài khoản mới
                </button>
            </div>

            {/* BẢNG 1: QUẢN TRỊ VIÊN */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-purple-500 pl-3">
                    Danh sách Quản trị viên
                </h2>
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-gray-300">
                                    <th className="p-4 font-semibold">Mã Quản Trị</th>
                                    <th className="p-4 font-semibold">Tên đăng nhập</th>
                                    <th className="p-4 font-semibold hidden md:table-cell">Email / Phone</th>
                                    <th className="p-4 font-semibold text-center">Trạng thái</th>
                                    <th className="p-4 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {adminList.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{admin.code}</td>
                                        <td className="p-4 font-semibold text-purple-700 dark:text-purple-400">{admin.username}</td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="text-sm text-gray-900 dark:text-gray-200">{admin.email}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{admin.phone}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                admin.status === 'active' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {admin.status === 'active' ? 'Đang HĐ' : 'Bị Khóa'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(admin)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md" title="Sửa">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                {userRole === 'admin' && (
                                                    <button onClick={() => handleDelete(admin.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" title="Xóa">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {adminList.length === 0 && (
                            <div className="p-8 text-center text-gray-500">Chưa có Quản trị viên nào.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* BẢNG 2: NHÂN VIÊN */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-blue-500 pl-3">
                    Danh sách Nhân viên
                </h2>
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-gray-300">
                                    <th className="p-4 font-semibold">Mã Nhân Viên</th>
                                    <th className="p-4 font-semibold">Tên đăng nhập</th>
                                    <th className="p-4 font-semibold hidden md:table-cell">Email / Phone</th>
                                    <th className="p-4 font-semibold text-center">Trạng thái</th>
                                    <th className="p-4 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {staffList.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{admin.code}</td>
                                        <td className="p-4 font-semibold text-blue-700 dark:text-blue-400">{admin.username}</td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="text-sm text-gray-900 dark:text-gray-200">{admin.email}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{admin.phone}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                admin.status === 'active' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {admin.status === 'active' ? 'Đang HĐ' : 'Bị Khóa'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(admin)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md" title="Sửa">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                {userRole === 'admin' && (
                                                    <button onClick={() => handleDelete(admin.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" title="Xóa">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {staffList.length === 0 && (
                            <div className="p-8 text-center text-gray-500">Chưa có Nhân viên nào.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Thêm/Sửa Tài khoản */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{formData.id ? "Cập nhật Tài khoản" : "Thêm Tài khoản Mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="adminForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã Tài khoản (Tự động)</label>
                                        <input type="text" value={formData.code} readOnly className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên đăng nhập *</label>
                                        <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={!!formData.id} placeholder="VD: STF001" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mật khẩu {formData.id ? "(Bỏ trống nếu không muốn đổi)" : "*"}
                                    </label>
                                    <input type="password" required={!formData.id} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="********" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@daukhidonga.vn" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                                        <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0989xxx" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ</label>
                                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Nhập địa chỉ..." className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-5 pt-2 border-t border-gray-100 dark:border-zinc-800">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phân quyền</label>
                                        <select 
                                            value={formData.role} 
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                role: e.target.value,
                                                code: formData.id ? formData.code : generateCode(e.target.value)
                                            })} 
                                            className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                            <option value="staff">Nhân viên (Staff)</option>
                                            <option value="admin">Quản trị viên (Admin)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                            <option value="active">Đang hoạt động</option>
                                            <option value="inactive">Khóa tài khoản</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors">
                                Hủy bỏ
                            </button>
                            <button type="submit" form="adminForm" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                {formData.id ? "Cập nhật" : "Tạo Tài khoản"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}