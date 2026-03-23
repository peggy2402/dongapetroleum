"use client";

import { useState, useEffect } from "react";

// Khai báo Interface ngay trong file để tiện sử dụng (Sau này bạn có thể chuyển ra thư mục models)
interface Customer {
    id: string;
    code: string;
    name: string;
    link: string;
    image: string;
    status: string;
    createdAt?: string;
}

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);

    // State cho Tìm kiếm và Phân trang
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State Modal và Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        code: "",
        name: "",
        link: "",
        image: "",
        status: "active"
    });

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, filterStatus, itemsPerPage]);

    const fetchCustomers = async (searchQuery = searchTerm) => {
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchQuery,
                status: filterStatus
            });
            // Tạm thời gọi API này, bạn sẽ cần tạo route /api/customers tương tự như categories
            const res = await fetch(`/api/customers?${query}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.total || 0);
            } else {
                // Mock data tạm thời để bạn test UI khi chưa có API
                if (customers.length === 0) {
                    setCustomers([
                        { id: "1", code: "CUS10234", name: "Công ty Cổ phần Thép Hòa Phát", link: "https://hoaphat.com.vn", image: "", status: "active" },
                        { id: "2", code: "CUS10235", name: "Tập đoàn Than Khoáng sản", link: "https://vinacomin.vn", image: "", status: "active" }
                    ]);
                    setTotalItems(2);
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải khách hàng:", error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCustomers();
    };

    const handleOpenModal = () => {
        setFormData({
            id: "",
            code: "CUS" + Math.floor(10000 + Math.random() * 90000),
            name: "",
            link: "",
            image: "",
            status: "active"
        });
        setIsModalOpen(true);
    };

    const handleEdit = (cus: Customer) => {
        setFormData({
            id: cus.id,
            code: cus.code || "",
            name: cus.name || "",
            link: cus.link || "",
            image: cus.image || "",
            status: cus.status || "active"
        });
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({ ...formData, image: data.url });
            } else {
                alert("Lỗi tải ảnh lên");
            }
        } catch (error) {
            console.error("Lỗi upload:", error);
            alert("Đã xảy ra lỗi khi tải ảnh.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(formData.id ? `/api/customers/${formData.id}` : "/api/customers", {
                method: formData.id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setCurrentPage(1); // Mặc định đưa về trang 1 để thấy data mới nhất (do DB sort createdAt: -1)
                fetchCustomers();
            } else {
                // Hỗ trợ Mock Update khi chưa có API
                setIsModalOpen(false);
                alert("Lưu thành công (Chế độ Mock UI)");
            }
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
            try {
                const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
                if (res.ok) {
                    fetchCustomers();
                } else {
                    alert("Đã xóa (Chế độ Mock UI)");
                    setCustomers(customers.filter(c => c.id !== id));
                }
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
            }
        }
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim() || !text) return text;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600/60 text-gray-900 dark:text-white rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-zinc-900 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý Đối tác / Khách hàng</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Cập nhật danh sách logo, đối tác hiển thị trên trang chủ.</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Thêm Khách hàng mới
                </button>
            </div>

            {/* Thanh Tìm kiếm & Lọc */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 mb-6 flex flex-col sm:flex-row gap-4 relative z-20">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm theo tên hoặc mã khách hàng..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-900 dark:text-white"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors border border-gray-300 dark:border-zinc-600">
                        Tìm kiếm
                    </button>
                </form>
                <div className="w-full sm:w-48">
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hiển thị</option>
                        <option value="inactive">Đang ẩn</option>
                    </select>
                </div>
            </div>

            {/* Table Danh sách */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-gray-300">
                                <th className="p-4 font-semibold w-12 text-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="p-4 font-semibold">Ảnh/Logo</th>
                                <th className="p-4 font-semibold">Mã KH</th>
                                <th className="p-4 font-semibold">Tên Khách hàng</th>
                                <th className="p-4 font-semibold hidden md:table-cell">Link Website</th>
                                <th className="p-4 font-semibold text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                            {customers.map((cus) => (
                                <tr key={cus.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="p-4 text-center">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="p-4">
                                        <div className="w-16 h-10 bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden flex items-center justify-center border border-gray-200 dark:border-zinc-600">
                                            {cus.image ? (
                                                <img src={cus.image} alt={cus.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <span className="text-xs text-gray-400">Trống</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{cus.code}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {highlightText(cus.name, searchTerm)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-blue-600 dark:text-blue-400 hidden md:table-cell hover:underline">
                                        <a href={cus.link} target="_blank" rel="noreferrer">{cus.link || "-"}</a>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cus.status === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {cus.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(cus)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md" title="Sửa">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDelete(cus.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" title="Xóa">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {customers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">Không tìm thấy khách hàng nào phù hợp.</div>
                    )}
                </div>

                {/* Thanh Phân trang */}
                {totalItems > 0 && (
                    <div className="p-4 border-t border-gray-100 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <span>
                                Hiển thị từ <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trong tổng số <span className="font-medium">{totalItems}</span>
                            </span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                            >
                                <option value={5}>5 / trang</option>
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                                <option value={50}>50 / trang</option>
                                <option value={100}>100 / trang</option>
                            </select>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 dark:text-white transition-colors">Trước</button>
                                <div className="flex items-center px-3 font-medium text-gray-700 dark:text-gray-200">Trang {currentPage} / {totalPages}</div>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 dark:text-white transition-colors">Sau</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{formData.id ? "Cập nhật Khách hàng" : "Thêm Khách hàng Mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="customerForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã (Tự động)</label>
                                        <input type="text" value={formData.code} readOnly className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên khách hàng / Đối tác *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Tập đoàn Hòa Phát" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Website (URL)</label>
                                    <input type="url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo / Hình ảnh</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-20 rounded border border-dashed border-gray-300 dark:border-zinc-600 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 text-gray-400 text-xs overflow-hidden p-1">
                                            {formData.image ? <img src={formData.image} alt="preview" className="w-full h-full object-contain" /> : "Trống"}
                                        </div>
                                        <div className="flex-1">
                                            <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-950 cursor-pointer" />
                                            {isUploading && <p className="text-xs text-blue-500 mt-1">Đang tải ảnh lên...</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        <option value="active">Hiển thị</option>
                                        <option value="inactive">Đang ẩn</option>
                                    </select>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-end gap-3 rounded-b-2xl">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors">
                                Hủy bỏ
                            </button>
                            <button type="submit" form="customerForm" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                {formData.id ? "Cập nhật" : "Lưu Khách hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}