"use client";

import { useState, useEffect } from "react";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "specs" | "content" | "seo">("general");
    const [isUploading, setIsUploading] = useState(false);

    // State Phân trang & Tìm kiếm bảng
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State cho Dropdown Danh mục trong Form
    const [catSearchTerm, setCatSearchTerm] = useState("");
    const [showCatSuggestions, setShowCatSuggestions] = useState(false);
    
    const [formData, setFormData] = useState({
        id: "",
        code: "",
        name: "",
        slug: "",
        categoryId: "",
        image: "",
        description: "",
        content: "",
        specificGravity: "",
        pourPoint: "",
        flashPoint: "",
        viscosity40: "",
        viscosity100: "",
        viscosityIndex: "",
        viscosityGrade: "",
        msds: "",
        pds: "",
        tags: "",
        order: 1,
        status: "active",
        seoTitle: "",
        seoDescription: ""
    });

    // Tải dữ liệu Sản phẩm và Danh mục khi vào trang
    useEffect(() => {
        fetchProducts();
    }, [currentPage, filterCategory, itemsPerPage]);

    useEffect(() => {
        fetchCategories(); // Lấy tất cả danh mục 1 lần
    }, []);

    const fetchProducts = async (searchQuery = searchTerm) => {
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(), limit: itemsPerPage.toString(), search: searchQuery, categoryId: filterCategory
            });
            const res = await fetch(`/api/products?${query}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setProducts(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.total || 0);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories?all=true", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

    const generateSlug = (str: string) => {
        return str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^a-z0-9-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleOpenModal = () => {
        setFormData({
            id: "",
            code: "PRD" + Math.floor(10000 + Math.random() * 90000),
            name: "", slug: "", categoryId: "", image: "", description: "", content: "",
            specificGravity: "", pourPoint: "", flashPoint: "", viscosity40: "", 
            viscosity100: "", viscosityIndex: "", viscosityGrade: "", msds: "", pds: "", tags: "",
            order: products.length + 1,
            status: "active", seoTitle: "", seoDescription: ""
        });
        setCatSearchTerm("");
        setIsModalOpen(true);
        setActiveTab("general");
    };

    const handleEdit = (prod: Product) => {
        setFormData({
            id: prod.id,
            code: prod.code || "",
            name: prod.name || "",
            slug: prod.slug || "",
            categoryId: prod.categoryId || "",
            image: prod.image || "",
            description: prod.description || "",
            content: prod.content || "",
            specificGravity: prod.specificGravity || "",
            pourPoint: prod.pourPoint || "",
            flashPoint: prod.flashPoint || "",
            viscosity40: prod.viscosity40 || "",
            viscosity100: prod.viscosity100 || "",
            viscosityIndex: prod.viscosityIndex || "",
            viscosityGrade: prod.viscosityGrade || "",
            msds: prod.msds || "",
            pds: prod.pds || "",
            tags: prod.tags || "",
            order: prod.order || 1,
            status: prod.status || "active",
            seoTitle: prod.seoTitle || "",
            seoDescription: prod.seoDescription || ""
        });

        const cat = categories.find(c => c.id === prod.categoryId);
        setCatSearchTerm(cat ? cat.name : "");

        setIsModalOpen(true);
        setActiveTab("general");
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
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = formData.id ? `/api/products/${formData.id}` : "/api/products";
            const method = formData.id ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
            } else {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await res.json();
                    alert("Lỗi: " + errorData.message);
                } else {
                    alert(`Lỗi hệ thống: ${res.status} ${res.statusText}`);
                }
            }
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            try {
                const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
                if (res.ok) fetchProducts();
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
            }
        }
    };

    // Hàm tiện ích để lấy tên danh mục từ ID
    const getCategoryName = (id: string) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : <span className="text-red-500 text-xs">Chưa chọn DM</span>;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý Sản phẩm</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý danh sách dầu nhớt, hóa chất của hệ thống.</p>
                </div>
                <button 
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Thêm Sản phẩm mới
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
                            placeholder="Tìm kiếm theo tên sản phẩm..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-900 dark:text-white"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors border border-gray-300 dark:border-zinc-600">
                        Tìm kiếm
                    </button>
                </form>
                <div className="w-full sm:w-64">
                    <select 
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-900 dark:text-white"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="relative z-10 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-gray-300">
                                <th className="p-4 font-semibold w-12 text-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="p-4 font-semibold">Hình ảnh</th>
                                <th className="p-4 font-semibold">Mã SP</th>
                                <th className="p-4 font-semibold">Tên Sản phẩm</th>
                                <th className="p-4 font-semibold">Danh mục</th>
                                <th className="p-4 font-semibold text-center w-24">Sắp xếp</th>
                                <th className="p-4 font-semibold text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                            {products.map((prod) => (
                                <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="p-4 text-center">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="p-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-700 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-zinc-600">
                                            <img src={prod.image || "/default-categories-img.jpg"} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{prod.code}</td>
                                    <td className="p-4 font-semibold text-gray-900 dark:text-white">
                                        {highlightText(prod.name, searchTerm)}
                                        <div className="text-xs text-gray-400 font-normal mt-0.5 hidden md:block">/{prod.slug}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 rounded-md border border-gray-200 dark:border-zinc-600">
                                            {getCategoryName(prod.categoryId)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-mono text-sm dark:text-gray-300">{prod.order}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                            prod.status === 'active' 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {prod.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(prod)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md" title="Sửa">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" title="Xóa">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="p-8 text-center text-gray-500">Chưa có sản phẩm nào. Hãy tạo mới!</div>
                    )}
                </div>
                
                {/* Thanh Phân trang */}
                {totalItems > 0 && (
                    <div className="p-4 border-t border-gray-100 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <span>
                                Hiển thị từ <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trong tổng số <span className="font-medium">{totalItems}</span>
                            </span>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
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

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{formData.id ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm Mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="px-6 pt-4 border-b border-gray-100 dark:border-zinc-800 flex gap-6">
                            <button onClick={() => setActiveTab("general")} className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Thông tin cơ bản</button>
                            <button onClick={() => setActiveTab("specs")} className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'specs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Thông số kỹ thuật</button>
                            <button onClick={() => setActiveTab("content")} className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'content' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Nội dung chi tiết</button>
                            <button onClick={() => setActiveTab("seo")} className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'seo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>SEO & Tags</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 relative z-10">
                            <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                                {activeTab === "general" && (
                                    <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã sản phẩm (Tự động)</label>
                                                <input type="text" value={formData.code} readOnly className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên sản phẩm *</label>
                                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="VD: Dầu thủy lực AW 68" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL tùy chỉnh (Slug)</label>
                                            <div className="flex rounded-lg shadow-sm">
                                                <span className="px-3 py-2.5 bg-gray-100 dark:bg-zinc-800 border border-r-0 border-gray-300 dark:border-zinc-700 rounded-l-lg text-gray-500 text-sm">/</span>
                                                <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="flex-1 rounded-r-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-[100]">
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thuộc danh mục *</label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" required
                                                        value={catSearchTerm}
                                                        onChange={(e) => { setCatSearchTerm(e.target.value); setShowCatSuggestions(true); if(e.target.value === "") setFormData({...formData, categoryId: ""}) }}
                                                        onFocus={() => setShowCatSuggestions(true)}
                                                        onBlur={() => setTimeout(() => setShowCatSuggestions(false), 200)}
                                                        placeholder="Tìm và chọn danh mục..."
                                                        className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                    {showCatSuggestions && (
                                                        <ul className="absolute bottom-full mb-1 left-0 right-0 z-[9999] w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] max-h-60 overflow-auto divide-y divide-gray-100 dark:divide-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                            {categories.filter(cat => cat.name.toLowerCase().includes(catSearchTerm.toLowerCase())).length > 0 ? (
                                                                categories.filter(cat => cat.name.toLowerCase().includes(catSearchTerm.toLowerCase())).map(cat => (
                                                                    <li key={cat.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, categoryId: cat.id }); setCatSearchTerm(cat.name); setShowCatSuggestions(false); }}>
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{highlightText(cat.name, catSearchTerm)}</div>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="px-4 py-3 text-sm text-gray-500 text-center">Không tìm thấy danh mục</li>
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn</label>
                                            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Thông tin tóm tắt sản phẩm..." className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5 relative z-10">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sắp xếp</label>
                                                <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                                    <option value="active">Hiển thị</option>
                                                    <option value="inactive">Đang ẩn</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "specs" && (
                                    <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cấp độ nhớt (Viscosity Grade)</label>
                                                <input type="text" value={formData.viscosityGrade} onChange={(e) => setFormData({ ...formData, viscosityGrade: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chỉ số nhớt (Viscosity Index)</label>
                                                <input type="text" value={formData.viscosityIndex} onChange={(e) => setFormData({ ...formData, viscosityIndex: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Độ nhớt 40°C</label>
                                                <input type="text" value={formData.viscosity40} onChange={(e) => setFormData({ ...formData, viscosity40: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Độ nhớt 100°C</label>
                                                <input type="text" value={formData.viscosity100} onChange={(e) => setFormData({ ...formData, viscosity100: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trọng lượng riêng</label>
                                                <input type="text" value={formData.specificGravity} onChange={(e) => setFormData({ ...formData, specificGravity: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Điểm đổ (°C)</label>
                                                <input type="text" value={formData.pourPoint} onChange={(e) => setFormData({ ...formData, pourPoint: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Điểm chớp cháy / Điểm sáng (°C)</label>
                                                <input type="text" value={formData.flashPoint} onChange={(e) => setFormData({ ...formData, flashPoint: e.target.value })} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                        </div>
                                        <hr className="border-gray-200 dark:border-zinc-800 my-4" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tài liệu MSDS (Link/Đường dẫn)</label>
                                                <input type="text" value={formData.msds} onChange={(e) => setFormData({ ...formData, msds: e.target.value })} placeholder="https://..." className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tài liệu PDS (Link/Đường dẫn)</label>
                                                <input type="text" value={formData.pds} onChange={(e) => setFormData({ ...formData, pds: e.target.value })} placeholder="https://..." className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "content" && (
                                    <div className="space-y-5 animate-in slide-in-from-right-2 duration-300 h-full flex flex-col">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bài viết mô tả chi tiết sản phẩm (Hỗ trợ HTML)</label>
                                            <textarea 
                                                rows={15} 
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                placeholder="<p>Sản phẩm này là...</p>" 
                                                className="w-full h-[400px] rounded-lg border-gray-300 border font-mono p-4 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                                            ></textarea>
                                            <p className="text-xs text-gray-500 mt-2">Sau này có thể tích hợp thư viện Editor (như CKEditor hoặc TinyMCE) vào ô này.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "seo" && (
                                    <div className="space-y-5 animate-in slide-in-from-left-2 duration-300">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (Ngăn cách bởi dấu phẩy)</label>
                                            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="VD: dau-nhot, cong-nghiep, pds" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề trang (SEO Title)</label>
                                            <input type="text" value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} placeholder="Độ dài khuyên dùng: 50-60 ký tự" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả SEO (Meta Description)</label>
                                            <textarea rows={4} value={formData.seoDescription} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} placeholder="Độ dài khuyên dùng: 150-160 ký tự" className="w-full rounded-lg border-gray-300 border p-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-end gap-3 rounded-b-2xl">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors">
                                Hủy bỏ
                            </button>
                            <button type="submit" form="productForm" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                {formData.id ? "Cập nhật Sản phẩm" : "Lưu Sản phẩm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}