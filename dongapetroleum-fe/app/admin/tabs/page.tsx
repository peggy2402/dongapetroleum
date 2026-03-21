"use client";

import { useState } from "react";
import { TabData } from "./types";
import TabForm from "@/app/components/tabs/TabForm";
import TabList from "@/app/components/tabs/TabList";
import TabModal from "@/app/components/tabs/TabModal";

export default function AdminTabsManagement() {
    // Dữ liệu mẫu (Mock data)
    const [tabs, setTabs] = useState<TabData[]>([
        {
            id: "1",
            name: "Giới thiệu",
            content: "<h1>Về Dầu Khí Đông Á</h1><p>Chúng tôi là đơn vị hàng đầu trong lĩnh vực...</p>",
            order: 1,
            status: "hiển thị",
        },
        {
            id: "2",
            name: "Liên hệ",
            content: "<p>Hotline: +84.989.991.246</p><p>Email: info@daukhidonga.vn</p>",
            order: 2,
            status: "hiển thị",
        },
    ]);

    // State hiển thị Modal xem chi tiết
    const [viewContent, setViewContent] = useState<TabData | null>(null);

    const handleAddTab = (newTabData: Omit<TabData, "id">) => {
        const newTab: TabData = {
            id: Date.now().toString(),
            ...newTabData
        };
        setTabs([...tabs, newTab].sort((a, b) => a.order - b.order));
        alert("Đã thêm Tab thành công!");
    };

    const handleDelete = (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa Tab này không?")) {
            setTabs(tabs.filter((tab) => tab.id !== id));
        }
    };

    const handleDeleteAll = () => {
        if (confirm("CẢNH BÁO: Xóa tất cả dữ liệu? Hành động này không thể hoàn tác.")) {
            setTabs([]);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-zinc-900 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý nội dung Tabs</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Thêm, sửa, xóa các trang như Giới thiệu, Liên hệ, Tin tức...</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI: FORM THÊM MỚI */}
                <div className="lg:col-span-1">
                    <TabForm onAdd={handleAddTab} tabsCount={tabs.length} />
                </div>

                {/* CỘT PHẢI: DANH SÁCH TABS */}
                <div className="lg:col-span-2">
                    <TabList tabs={tabs} onDeleteAll={handleDeleteAll} onDelete={handleDelete} onView={setViewContent} />
                </div>
            </div>

            {/* MODAL HIỂN THỊ CHI TIẾT NỘI DUNG (CLEAN UI) */}
            {viewContent && (
                <TabModal viewContent={viewContent} onClose={() => setViewContent(null)} />
            )}
        </div>
    );
}