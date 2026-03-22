"use client";

import { useState, useEffect } from "react";
import { Category } from "@/models/Category";

export default function AdminCategories() {
    // Khởi tạo mảng rỗng để chuẩn bị nhận dữ liệu thực từ API
    const [categories, setCategories] = useState<Category[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]); // Lưu toàn bộ để đổ vào thẻ <select>

    // State cho Tìm kiếm và Phân trang
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showSuggestions, setShowSuggestions] = useState(false); // State bật tắt Dropdown

    // State riêng cho Input Tìm kiếm của phần "Danh mục cha" trong Modal
    const [parentSearchTerm, setParentSearchTerm] = useState("");
    const [showParentSuggestions, setShowParentSuggestions] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "seo">("general");
    const [isUploading, setIsUploading] = useState(false);
    
    // State chứa toàn bộ dữ liệu form để gửi lên API
    const [formData, setFormData] = useState({
        id: "", // Thêm id để nhận biết Thêm hay Sửa
        code: "",
        name: "",
        slug: "",
        description: "",
        parentId: "",
        image: "",
        order: 1,
        status: "active",
        seoTitle: "",
        seoDescription: "",
        seoContent: ""
    });

    // Gọi API lấy dữ liệu từ MongoDB khi vừa vào trang
    useEffect(() => {
        fetchCategories();
    }, [currentPage, filterStatus, itemsPerPage]); // Tự động gọi lại khi đổi trang, đổi bộ lọc, hoặc đổi số lượng hiển thị

    // Lấy riêng toàn bộ danh mục một lần khi mới vào để cho thẻ select "Danh mục cha"
    useEffect(() => {
        fetchAllCategories();
    }, []);

    const fetchAllCategories = async () => {
        try {
            const res = await fetch("/api/categories?all=true", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setAllCategories(data);
            }
        } catch (error) {
            console.error("Lỗi lấy tất cả DM:", error);
        }
    }

    // Nhận tham số động để có thể Search ngay khi vừa bấm chọn gợi ý
    const fetchCategories = async (searchQuery = searchTerm) => {
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchQuery,
                status: filterStatus
            });
            const res = await fetch(`/api/categories?${query}`, { cache: "no-store" });
            const data = await res.json();
            if (res.ok) {
                setCategories(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.total || 0);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Quay về trang 1 khi tìm kiếm
        fetchCategories();
    }

    // Hàm khi người dùng bấm vào 1 dòng gợi ý trong Dropdown
    const handleSuggestionClick = (name: string) => {
        setSearchTerm(name);         // Điền tên vào ô input
        setShowSuggestions(false);   // Đóng dropdown
        setCurrentPage(1);           // Đưa về trang 1
        fetchCategories(name);       // Tự động tìm kiếm ngay lập tức
    };

    // Hàm chuyển đổi Tiếng Việt có dấu thành URL (Slug)
    const generateSlug = (str: string) => {
        return str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Xóa dấu
            .replace(/[đĐ]/g, "d") // Thay thế chữ đ
            .replace(/([^a-z0-9-\s])/g, "") // Xóa ký tự đặc biệt
            .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
            .replace(/-+/g, "-") // Xóa gạch ngang thừa
            .replace(/^-+|-+$/g, ""); // Cắt gạch ngang ở đầu và cuối
    };

    // Mở Modal và làm mới Form
    const handleOpenModal = () => {
        setFormData({
            ...formData,
            id: "", // Reset id về rỗng khi Thêm mới
            code: "CAT" + Math.floor(10000 + Math.random() * 90000), // Mã tự động
            name: "", slug: "", description: "", parentId: "", image: "",
            order: allCategories.length + 1, // Tự động gợi ý số thứ tự tiếp theo dựa trên tổng số thực tế
            status: "active", seoTitle: "", seoDescription: "", seoContent: ""
        });
        setParentSearchTerm(""); // Reset thanh tìm kiếm danh mục cha
        setIsModalOpen(true);
        setActiveTab("general");
    };

    // Hàm Mở Modal Sửa và đổ dữ liệu vào Form
    const handleEdit = (cat: Category) => {
        setFormData({
            id: cat.id,
            code: cat.code || "",
            name: cat.name || "",
            slug: cat.slug || "",
            description: cat.description || "",
            parentId: cat.parentId || "",
            image: cat.image || "",
            order: cat.order || 1,
            status: cat.status || "active",
            seoTitle: cat.seoTitle || "",
            seoDescription: cat.seoDescription || "",
            seoContent: cat.seoContent || ""
        });
        
        // Hiển thị sẵn tên danh mục cha vào ô input nếu có
        const parent = allCategories.find(c => c.id === cat.parentId);
        setParentSearchTerm(parent ? parent.name : "");

        setIsModalOpen(true);
        setActiveTab("general");
    };

    // Hàm xử lý Upload ảnh
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
                setFormData({ ...formData, image: data.url }); // Gán URL ảnh vừa upload vào form
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

    // Hàm Gửi dữ liệu (Lưu vào MongoDB)
    const handleSubmit = async () => {
        try {
            const res = await fetch(formData.id ? `/api/categories/${formData.id}` : "/api/categories", {
                method: formData.id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchAllCategories(); // Cập nhật lại dropdown danh mục cha
                fetchCategories(); // Gọi lại danh sách để cập nhật bảng
            }
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
        }
    };

    // Hàm xóa danh mục
    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                const res = await fetch(`/api/categories/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    fetchAllCategories();
                    fetchCategories(); // Gọi lại API để cập nhật bảng
                }
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
            }
        }
    };

    // Hàm tô sáng từ khóa tìm kiếm (Highlight màu vàng)
    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim() || !text) return text;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600/60 text-gray-900 dark:text-white rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>
        );
    };

    // Hàm lấy tên danh mục cha
    const getParentName = (parentId: string | null) => {
        if (!parentId) return null;
        const parent = allCategories.find(c => c.id === parentId);
        return parent ? parent.name : "Không xác định";
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-zinc-900 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý Danh mục</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý cấu trúc cây danh mục sản phẩm của hệ thống.</p>
                </div>
                <button 
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Thêm danh mục mới
                </button>
            </div>

            {/* Thanh Tìm kiếm & Lọc */}
            <div className="relative z-[60] bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 mb-6 flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay 1 chút để click không bị hụt
                            placeholder="Tìm kiếm theo tên danh mục..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-900 dark:text-white"
                        />
                        
                        {/* Khu vực Dropdown thả xuống */}
                        {showSuggestions && searchTerm.trim() && (
                            <ul className="absolute top-full mt-2 left-0 right-0 z-[100] w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] max-h-60 overflow-auto divide-y divide-gray-100 dark:divide-zinc-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                {allCategories.filter(cat => cat.name.toLowerCase().includes(searchTerm.trim().toLowerCase())).length > 0 ? (
                                    allCategories.filter(cat => cat.name.toLowerCase().includes(searchTerm.trim().toLowerCase())).map(cat => (
                                        <li 
                                            key={cat.id} 
                                            className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                                            onMouseDown={(e) => { 
                                                e.preventDefault(); // Ngăn ô input mất tiêu điểm
                                                handleSuggestionClick(cat.name); 
                                            }}
                                        >
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {highlightText(cat.name, searchTerm)}
                                            </div>
                                            {cat.parentId && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                                    Thuộc: {highlightText(getParentName(cat.parentId) || "", searchTerm)}
                                                </div>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">Không có gợi ý nào phù hợp</li>
                                )}
                            </ul>
                        )}
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
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-gray-300">
                                <th className="p-4 font-semibold w-12 text-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="p-4 font-semibold">Hình ảnh</th>
                                <th className="p-4 font-semibold">Mã DM</th>
                                <th className="p-4 font-semibold">Tên danh mục</th>
                                <th className="p-4 font-semibold hidden lg:table-cell">Mô tả</th>
                                <th className="p-4 font-semibold hidden md:table-cell">URL (Slug)</th>
                                <th className="p-4 font-semibold text-center w-24">Sắp xếp</th>
                                <th className="p-4 font-semibold text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="p-4 text-center">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="p-4">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-zinc-600">
                                            <img src={cat.image || "/default-categories-img.jpg"} alt={cat.name} className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{cat.code}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {highlightText(cat.name, searchTerm)}
                                        </div>
                                        {cat.parentId && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                                Thuộc: {highlightText(getParentName(cat.parentId) || "", searchTerm)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell truncate max-w-[200px]">{cat.description}</td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">/{cat.slug}</td>
                                    <td className="p-4 text-center font-mono text-sm dark:text-gray-300">{cat.order}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                            cat.status === 'active' 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {cat.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md" title="Sửa">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" title="Xóa">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {categories.length === 0 && (
                        <div className="p-8 text-center text-gray-500">Không tìm thấy danh mục nào phù hợp.</div>
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
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 dark:text-white transition-colors">
                                    Trước
                                </button>
                                <div className="flex items-center px-3 font-medium text-gray-700 dark:text-gray-200">Trang {currentPage} / {totalPages}</div>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 dark:text-white transition-colors">
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa Danh mục */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{formData.id ? "Cập nhật Danh mục" : "Thêm Danh mục Mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Custom Tabs in Modal */}
                        <div className="px-6 pt-4 border-b border-gray-100 dark:border-zinc-800 flex gap-6">
                            <button 
                                onClick={() => setActiveTab("general")}
                                className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Thông tin cơ bản
                            </button>
                            <button 
                                onClick={() => setActiveTab("seo")}
                                className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'seo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Tối ưu SEO
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 relative z-10">
                            <form className="space-y-5">
                                {activeTab === "general" ? (
                                    <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã danh mục (Tự động)</label>
                                                <input type="text" value={formData.code} readOnly className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên danh mục *</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ 
                                                        ...formData, 
                                                        name: e.target.value, 
                                                        slug: generateSlug(e.target.value) // Tự động tạo slug khi gõ tên
                                                    })}
                                                    placeholder="VD: Dầu công nghiệp" 
                                                    className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL tùy chỉnh (Slug)</label>
                                            <div className="flex rounded-lg shadow-sm">
                                                <span className="px-3 py-2.5 bg-gray-100 dark:bg-zinc-800 border border-r-0 border-gray-300 dark:border-zinc-700 rounded-l-lg text-gray-500 text-sm">/</span>
                                                <input 
                                                    type="text" 
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    placeholder="dau-cong-nghiep" 
                                                    className="flex-1 rounded-r-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn</label>
                                            <textarea 
                                                rows={2} 
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Nhập mô tả cho danh mục..." 
                                                className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5 relative z-[100]">
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục cha</label>
                                                <div className="relative">
                                                    <input 
                                                        type="text"
                                                        value={parentSearchTerm}
                                                        onChange={(e) => {
                                                            setParentSearchTerm(e.target.value);
                                                            setShowParentSuggestions(true);
                                                            if (e.target.value === "") setFormData({ ...formData, parentId: "" });
                                                        }}
                                                        onFocus={() => setShowParentSuggestions(true)}
                                                        onBlur={() => setTimeout(() => setShowParentSuggestions(false), 200)}
                                                        placeholder="Tìm hoặc chọn danh mục cha..."
                                                        className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                    {showParentSuggestions && (
                                                        <ul className="absolute bottom-full mb-1 left-0 right-0 z-[9999] w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] max-h-60 overflow-auto divide-y divide-gray-100 dark:divide-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                            <li 
                                                                className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors text-sm text-gray-500 italic"
                                                                onClick={() => { setFormData({ ...formData, parentId: "" }); setParentSearchTerm(""); setShowParentSuggestions(false); }}
                                                            >
                                                                -- Là danh mục gốc --
                                                            </li>
                                                            {allCategories.filter(cat => cat.name.toLowerCase().includes(parentSearchTerm.trim().toLowerCase()) && cat.id !== formData.id).length > 0 ? (
                                                                allCategories.filter(cat => cat.name.toLowerCase().includes(parentSearchTerm.trim().toLowerCase()) && cat.id !== formData.id).map(cat => (
                                                                    <li 
                                                                        key={cat.id} 
                                                                        className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                                                                        onMouseDown={(e) => { 
                                                                            e.preventDefault(); // Ngăn ô input mất tiêu điểm
                                                                            setFormData({ ...formData, parentId: cat.id }); 
                                                                            setParentSearchTerm(cat.name); setShowParentSuggestions(false); 
                                                                        }}
                                                                    >
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            {highlightText(cat.name, parentSearchTerm)}
                                                                        </div>
                                                                        {cat.parentId && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                                                                Thuộc: {highlightText(getParentName(cat.parentId) || "", parentSearchTerm)}
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">Không tìm thấy danh mục</li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh đại diện</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded border border-dashed border-gray-300 dark:border-zinc-600 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 text-gray-400 text-xs overflow-hidden">
                                                        {formData.image ? <img src={formData.image} alt="preview" className="w-full h-full object-cover" /> : "Trống"}
                                                    </div>
                                                    <div className="flex-1">
                                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-950 cursor-pointer" />
                                                        {isUploading && <p className="text-xs text-blue-500 mt-1">Đang tải ảnh lên...</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sắp xếp</label>
                                                <input 
                                                    type="number" 
                                                    value={formData.order}
                                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                                    className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                                                <select 
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                >
                                                    <option value="active">Hiển thị</option>
                                                    <option value="inactive">Đang ẩn</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5 animate-in slide-in-from-left-2 duration-300">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề trang (SEO Title)</label>
                                            <input 
                                                type="text" 
                                                value={formData.seoTitle}
                                                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                                placeholder="Độ dài khuyên dùng: 50-60 ký tự" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả SEO (Meta Description)</label>
                                            <textarea 
                                                rows={3} 
                                                value={formData.seoDescription}
                                                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                                placeholder="Độ dài khuyên dùng: 150-160 ký tự" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung thẻ H (Mô tả chi tiết danh mục để hỗ trợ SEO)</label>
                                            <textarea 
                                                rows={4} 
                                                value={formData.seoContent}
                                                onChange={(e) => setFormData({ ...formData, seoContent: e.target.value })}
                                                placeholder="Nhập mã HTML hoặc nội dung chi tiết..." className="w-full rounded-lg border-gray-300 border font-mono p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors">
                                Hủy bỏ
                            </button>
                            <button onClick={handleSubmit} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                {formData.id ? "Cập nhật" : "Lưu Danh mục"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}