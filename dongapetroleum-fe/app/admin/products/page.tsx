"use client";

import { useState, useEffect } from "react";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Editor } from '@tinymce/tinymce-react';

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
    
    // STATE SIÊU CẤP CHO BẢNG LƯỚI ĐỘNG (THAY THẾ TINYMCE)
    const [cols, setCols] = useState<{id: number, main: string, subs: string[]}[]>([
        { id: 1, main: "Thuộc tính", subs: [] }, { id: 2, main: "Giá trị", subs: [] }
    ]);
    const [rows, setRows] = useState<string[][]>([["", ""]]);

    const [formData, setFormData] = useState({
        id: "",
        code: "",
        name: "",
        slug: "",
        categoryId: "",
        image: "",
        description: "",
        content: "",
        specsContent: "", // Trống rỗng để đón trình soạn thảo Word
        isFeatured: false,
        isNewProduct: false,
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

    // Tự động đồng bộ Lưới Excel vào Database (Dạng JSON)
    useEffect(() => {
        if (isModalOpen) {
            setFormData(prev => ({ ...prev, specsContent: JSON.stringify({ cols, rows }) }));
        }
    }, [cols, rows, isModalOpen]);

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
    // Hàm lấy tên đầy đủ của danh mục (Bao gồm cả danh mục cha nếu có)
    const getFullCategoryName = (cat: Category) => {
        if (cat.parentId) {
            return `${cat.name} (${getParentCategoryName(cat.parentId)})`;
        }
        return cat.name;
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
            specsContent: "",
            isFeatured: false,
            isNewProduct: false,
            msds: "", pds: "", tags: "",
            order: products.length + 1,
            status: "active", seoTitle: "", seoDescription: ""
        });
        setCatSearchTerm("");
        setCols([{ id: 1, main: "Thuộc tính", subs: [] }, { id: 2, main: "Giá trị", subs: [] }]);
        setRows([["", ""]]);
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
            specsContent: prod.specsContent || "",
            isFeatured: prod.isFeatured || false,
            isNewProduct: prod.isNewProduct || false,
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
        
        try {
            if (prod.specsContent) {
                const parsed = JSON.parse(prod.specsContent);
                if (parsed.cols && parsed.rows) { setCols(parsed.cols); setRows(parsed.rows); }
                else { setCols([{ id: 1, main: "Thuộc tính", subs: [] }, { id: 2, main: "Giá trị", subs: [] }]); setRows([["", ""]]); }
            } else { setCols([{ id: 1, main: "Thuộc tính", subs: [] }, { id: 2, main: "Giá trị", subs: [] }]); setRows([["", ""]]); }
        } catch {
            setCols([{ id: 1, main: "Thuộc tính", subs: [] }, { id: 2, main: "Giá trị", subs: [] }]); setRows([["", ""]]);
        }

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

    // Hàm lấy tên danh mục cha để hiển thị trong Dropdown
    const getParentCategoryName = (parentId: string | null) => {
        if (!parentId) return null;
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : "Không xác định";
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim() || !text) return text;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600/60 text-gray-900 dark:text-white rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>
        );
    };

    // ==========================================
    // CÁC HÀM XỬ LÝ LƯỚI EXCEL (BẢNG THÔNG SỐ)
    // ==========================================
    const addCol = () => {
        setCols([...cols, { id: Date.now(), main: "", subs: [] }]);
        setRows(rows.map(r => [...r, ""]));
    };

    const removeCol = (index: number) => {
        if (cols.length <= 1) return alert("Phải có ít nhất 1 cột!");
        const colToRemove = cols[index];
        const removeCount = Math.max(1, colToRemove.subs.length);
        let startIdx = 0;
        for(let i=0; i<index; i++) startIdx += Math.max(1, cols[i].subs.length);
        setCols(cols.filter((_, i) => i !== index));
        setRows(rows.map(r => { const newR = [...r]; newR.splice(startIdx, removeCount); return newR; }));
    };

    const addSub = (colIndex: number) => {
        const newCols = [...cols]; const col = newCols[colIndex];
        if (col.subs.length === 0) {
            col.subs = ["", ""];
            let startIdx = 0;
            for(let i=0; i<=colIndex; i++) startIdx += Math.max(1, cols[i].subs.length);
            setRows(rows.map(r => { const newR = [...r]; newR.splice(startIdx - 1, 0, ""); return newR; }));
        } else {
            col.subs.push("");
            let startIdx = 0;
            for(let i=0; i<=colIndex; i++) startIdx += Math.max(1, cols[i].subs.length);
            setRows(rows.map(r => { const newR = [...r]; newR.splice(startIdx - 1, 0, ""); return newR; }));
        }
        setCols(newCols);
    };

    const removeSub = (colIndex: number, subIndex: number) => {
        const newCols = [...cols]; const col = newCols[colIndex];
        let physicalIdx = 0;
        for(let i=0; i<colIndex; i++) physicalIdx += Math.max(1, cols[i].subs.length);
        physicalIdx += subIndex;
        col.subs.splice(subIndex, 1);
        setCols(newCols);
        setRows(rows.map(r => {
            const newR = [...r]; newR.splice(physicalIdx, 1);
            if (col.subs.length === 0) newR.splice(physicalIdx, 0, "");
            return newR;
        }));
    };

    const updateMain = (colIndex: number, val: string) => {
        const newCols = [...cols]; newCols[colIndex].main = val; setCols(newCols);
    };

    const updateSub = (colIndex: number, subIndex: number, val: string) => {
        const newCols = [...cols]; newCols[colIndex].subs[subIndex] = val; setCols(newCols);
    };

    const updateCell = (rowIndex: number, physicalColIndex: number, val: string) => {
        const newRows = [...rows]; newRows[rowIndex][physicalColIndex] = val; setRows(newRows);
    };

    // ==========================================
    // TÍNH NĂNG AUTO-FILL (TẢI MẪU BẢNG)
    // ==========================================
    const loadTemplate = (type: "oil" | "grease" | "advanced" | "grease-complex" | "grease-lithium" | "basic" | "clear") => {
        if (type === "oil") {
            setCols([
                { id: Date.now() + 1, main: "Density\nkg/L", subs: [] },
                { id: Date.now() + 2, main: "Pour Point\n°C", subs: [] },
                { id: Date.now() + 3, main: "Flash Point, °C", subs: [] },
                { id: Date.now() + 4, main: "Kinematic Viscosity\ncSt", subs: ["cSt @ 40 ℃", "cSt @ 100 ℃"] },
                { id: Date.now() + 5, main: "Viscosity\nIndex", subs: [] },
                { id: Date.now() + 6, main: "Grade\nISO", subs: [] }
            ]);
            setRows([["", "", "", "", "", "", ""]]); // 7 ô trống do cột Kinematic có 2 cột con
        } else if (type === "grease") {
            setCols([
                { id: Date.now() + 1, main: "Temperature range,ºC", subs: [] },
                { id: Date.now() + 2, main: "Thickener", subs: [] },
                { id: Date.now() + 3, main: "Dropping Point,°C", subs: [] },
                { id: Date.now() + 4, main: "Worked penetration", subs: ["Min", "Max"] },
                { id: Date.now() + 5, main: "Base oil", subs: [] },
                { id: Date.now() + 6, main: "NLGI Grade", subs: [] }
            ]);
            setRows([["-5 to 125", "Lithium", "185", "220", "250", "Mineral", "3"]]);
        } else if (type === "advanced") {
            setCols([
                { id: Date.now() + 1, main: "Density @", subs: [] },
                { id: Date.now() + 2, main: "Pour Point, °C", subs: [] },
                { id: Date.now() + 3, main: "Worked Cone Penetration", subs: [] },
                { id: Date.now() + 4, main: "Copper Corrossion(T2 copper,100℃,24h)", subs: ["PB", "PD"] },
                { id: Date.now() + 5, main: "Seperation Capacity,volume fraction(100℃,24h)", subs: [] },
                { id: Date.now() + 6, main: "Grade ISO", subs: [] }
            ]);
            setRows([["", "310", "282", "784", "1.960", "1,68", ""]]);
        } else if (type === "grease-complex") {
            setCols([
                { id: Date.now() + 1, main: "Temperature range, ºC", subs: [] },
                { id: Date.now() + 2, main: "4 Ball Weld Point, Kg", subs: [] },
                { id: Date.now() + 3, main: "Dropping Point, °C", subs: [] },
                { id: Date.now() + 4, main: "Base Oil Viscosity", subs: ["cSt @ 40 ℃", "cSt @ 100 ℃"] },
                { id: Date.now() + 5, main: "Base Oil", subs: [] },
                { id: Date.now() + 6, main: "Thickener", subs: [] }
            ]);
            setRows([["-30 to 160", "310", "260", "180", "", "Mineral", "Lithium Complex"]]);
        } else if (type === "grease-lithium") {
            setCols([
                { id: Date.now() + 1, main: "Operating temp,°C", subs: [] },
                { id: Date.now() + 2, main: "Thickener", subs: [] },
                { id: Date.now() + 3, main: "Dropping Point,°C", subs: [] },
                { id: Date.now() + 4, main: "Kinematic Viscosity", subs: ["cSt @ 40 ℃", "cSt @ 100 ℃"] },
                { id: Date.now() + 5, main: "Base oil", subs: [] },
                { id: Date.now() + 6, main: "NLGI Grade", subs: [] }
            ]);
            setRows([["-20 to 130", "Lithium", "200", "185", "13", "Mineral", "I"]]);
        } else if (type === "basic") {
            setCols([{ id: Date.now() + 1, main: "Thuộc tính", subs: [] }, { id: Date.now() + 2, main: "Giá trị", subs: [] }]);
            setRows([["", ""]]);
        } else if (type === "clear") {
            if (confirm("Bạn có chắc muốn xóa toàn bộ bảng hiện tại?")) {
                setCols([{ id: Date.now(), main: "Cột 1", subs: [] }]);
                setRows([[""]]);
            }
        }
    };
    // ==========================================

    // Cấu hình thanh công cụ Word (TinyMCE)
    const editorInitConfig = {
        height: 500,
        menubar: 'file edit view insert format tools table help', // Bật menu Table chuyên dụng
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
            'table tabledelete | tableprops tablerowprops tablecellprops | ' +
            'bullist numlist outdent indent | removeformat | help',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size:14px }'
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
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {highlightText(prod.name, searchTerm)}
                                            {prod.isFeatured && <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">Nổi bật</span>}
                                            {prod.isNewProduct && <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Mới</span>}
                                        </div>
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
                                                            {categories.filter(cat => getFullCategoryName(cat).toLowerCase().includes(catSearchTerm.toLowerCase())).length > 0 ? (
                                                                categories.filter(cat => getFullCategoryName(cat).toLowerCase().includes(catSearchTerm.toLowerCase())).map(cat => (
                                                                    <li key={cat.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors" onMouseDown={(e) => { 
                                                                        e.preventDefault(); // Ngăn ô input mất tiêu điểm
                                                                        setFormData({ ...formData, categoryId: cat.id }); 
                                                                        setCatSearchTerm(getFullCategoryName(cat)); setShowCatSuggestions(false); 
                                                                    }}>
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{highlightText(cat.name, catSearchTerm)}</div>
                                                                        {cat.parentId && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                                                                Thuộc: {highlightText(getParentCategoryName(cat.parentId) || "", catSearchTerm)}
                                                                            </div>
                                                                        )}
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

                                        <div className="grid grid-cols-2 gap-5 pt-4 mt-2 border-t border-gray-100 dark:border-zinc-800 relative z-10">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all cursor-pointer" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 transition-colors">🔥 Đánh dấu là Sản phẩm Nổi bật</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" checked={formData.isNewProduct} onChange={(e) => setFormData({ ...formData, isNewProduct: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all cursor-pointer" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 transition-colors">✨ Đánh dấu là Sản phẩm Mới</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "specs" && (
                                    <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Bảng Thông số kỹ thuật (Giao diện Excel Động)
                                                </label>
                                                <span className="text-xs text-gray-500 block mt-1">
                                                    Tự do gõ: Bấm nút <strong className="text-blue-500 px-1 bg-blue-50 rounded">[+]</strong> trên mỗi cột để "Lồng thêm cột con" y hệt yêu cầu!
                                                </span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap justify-end">
                                                {/* Nút Auto-fill */}
                                                <div className="relative group inline-block">
                                                    <button type="button" className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200 flex items-center gap-1">
                                                        <span>✨ Auto-fill Mẫu</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </button>
                                                    {/* Lớp bọc tàng hình (pt-1) làm "Cầu nối" để giữ chuột không bị rớt */}
                                                    <div className="absolute right-0 top-full pt-1 w-48 hidden group-hover:block z-50">
                                                        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                                                            <button type="button" onClick={() => loadTemplate('oil')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">🛢️ Mẫu Dầu Nhớt</button>
                                                            <button type="button" onClick={() => loadTemplate('grease')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 border-t border-gray-100 dark:border-zinc-700 transition-colors">⚙️ Mẫu Mỡ Bôi Trơn</button>
                                                            <button type="button" onClick={() => loadTemplate('advanced')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 border-t border-gray-100 dark:border-zinc-700 transition-colors">🧪 Mẫu Phức Hợp</button>
                                                            <button type="button" onClick={() => loadTemplate('grease-complex')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 border-t border-gray-100 dark:border-zinc-700 transition-colors">⚙️ Mẫu Mỡ Lithium Complex</button>
                                                            <button type="button" onClick={() => loadTemplate('grease-lithium')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 border-t border-gray-100 dark:border-zinc-700 transition-colors">⚙️ Mẫu Mỡ LUBEX</button>
                                                            <button type="button" onClick={() => loadTemplate('basic')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 border-t border-gray-100 dark:border-zinc-700 transition-colors">📑 Mẫu 2 cột cơ bản</button>
                                                            <button type="button" onClick={() => loadTemplate('clear')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-zinc-700 transition-colors">🗑️ Xóa trắng bảng</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={addCol} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200">+ Thêm cột</button>
                                                <button type="button" onClick={() => setRows([...rows, Array(cols.reduce((sum, c) => sum + Math.max(1, c.subs.length), 0)).fill("")])} className="px-3 py-1.5 bg-green-50 text-green-600 rounded text-sm font-medium hover:bg-green-100 transition-colors border border-green-200">+ Thêm hàng</button>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm">
                                            <table className="w-full text-center border-collapse min-w-max">
                                                <thead>
                                                    <tr className="bg-gray-100 dark:bg-zinc-800 border-b border-gray-300 dark:border-zinc-700">
                                                        {cols.map((c, i) => (
                                                            <th key={c.id} rowSpan={cols.some(c => c.subs.length > 0) && c.subs.length === 0 ? 2 : 1} colSpan={Math.max(1, c.subs.length)} className="border-r border-gray-300 dark:border-zinc-700 p-2 relative group min-w-[150px]">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <input value={c.main} onChange={(e) => updateMain(i, e.target.value)} placeholder="Tên cột chính..." className="w-full bg-transparent text-center font-bold text-gray-800 dark:text-gray-200 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500 rounded px-1 py-1 transition-all" />
                                                                    <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 absolute right-2 top-2">
                                                                        <button type="button" onClick={() => addSub(i)} title="Chia lồng cột con" className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-bold shadow">+</button>
                                                                        {cols.length > 1 && <button type="button" onClick={() => removeCol(i)} title="Xóa toàn bộ cột này" className="w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 text-xs font-bold shadow">x</button>}
                                                                    </div>
                                                                </div>
                                                            </th>
                                                        ))}
                                                        <th rowSpan={cols.some(c => c.subs.length > 0) ? 2 : 1} className="w-16 bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-300 dark:border-zinc-700"></th>
                                                    </tr>
                                                    {cols.some(c => c.subs.length > 0) && (
                                                        <tr className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-300 dark:border-zinc-700">
                                                            {cols.map((c, i) => {
                                                                if (c.subs.length === 0) return null;
                                                                return c.subs.map((sub, sIdx) => (
                                                                    <th key={sIdx} className="border-r border-t border-gray-300 dark:border-zinc-700 p-1.5 relative group min-w-[100px]">
                                                                        <div className="flex items-center justify-center">
                                                                            <input value={sub} onChange={(e) => updateSub(i, sIdx, e.target.value)} placeholder="Tên cột con..." className="w-full bg-transparent text-center text-sm font-semibold text-gray-600 dark:text-gray-400 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500 rounded px-1 py-1 transition-all" />
                                                                            <button type="button" onClick={() => removeSub(i, sIdx)} title="Xóa cột con" className="opacity-0 group-hover:opacity-100 absolute right-1 w-4 h-4 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold">x</button>
                                                                        </div>
                                                                    </th>
                                                                ));
                                                            })}
                                                        </tr>
                                                    )}
                                                </thead>
                                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                                                    {rows.map((row, rIdx) => (
                                                        <tr key={rIdx} className="hover:bg-blue-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                            {row.map((cell, cIdx) => (
                                                                <td key={cIdx} className="p-0 border-r border-gray-200 dark:border-zinc-800">
                                                                    <input value={cell} onChange={(e) => updateCell(rIdx, cIdx, e.target.value)} placeholder="-" className="w-full py-3 text-center text-sm bg-transparent outline-none focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 transition-all" />
                                                                </td>
                                                            ))}
                                                            <td className="p-0 text-center bg-gray-50 dark:bg-zinc-800/50">
                                                                <button type="button" onClick={() => { const newRows = [...rows]; newRows.splice(rIdx, 1); setRows(newRows); }} className="w-full h-full p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Xóa hàng này">
                                                                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Phần đính kèm Tài liệu */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
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
                                            <div className="border border-gray-300 dark:border-zinc-700 rounded-lg overflow-hidden">
                                                <Editor
                                                    apiKey={process.env.TINYMCE_API_KEY}
                                                    init={editorInitConfig}
                                                    value={formData.content}
                                                    onEditorChange={(content) => setFormData({ ...formData, content: content })}
                                                />
                                            </div>
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