"use client";

import { useState } from "react";
import { TabData } from "@/app/admin/tabs/types";

interface TabFormProps {
    onAdd: (tab: Omit<TabData, "id">) => void;
    tabsCount: number;
}

export default function TabForm({ onAdd, tabsCount }: TabFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        content: "",
        seoTitle: "",
        seoDescription: "",
        order: tabsCount + 1,
        status: "hiển thị" as "hiển thị" | "không hiển thị",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name: formData.name,
            content: formData.content,
            order: Number(formData.order),
            status: formData.status,
        });
        // Xóa form sau khi gửi
        setFormData({ name: "", content: "", seoTitle: "", seoDescription: "", order: tabsCount + 2, status: "hiển thị" });
    };

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">Thêm Tab Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">1. Tên Tab (VD: Giới thiệu)</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 border p-2 text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white" />
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-zinc-700">
                    <span className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Cấu hình SEO</span>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300">Meta Title (Tiêu đề SEO)</label>
                            <input type="text" name="seoTitle" placeholder="Dầu Khí Đông Á - Giới thiệu..." value={formData.seoTitle} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 border p-2 text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300">Meta Description (Mô tả SEO)</label>
                            <textarea name="seoDescription" rows={2} placeholder="Nội dung tóm tắt hiển thị trên Google..." value={formData.seoDescription} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 border p-2 text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">2. Nội dung Tab (Hỗ trợ HTML)</label>
                    <textarea name="content" required rows={8} value={formData.content} onChange={handleInputChange} placeholder="<p>Viết nội dung vào đây...</p>" className="mt-1 w-full rounded-md border-gray-300 border p-2 text-sm font-mono dark:bg-zinc-900 dark:border-zinc-600 dark:text-white" />
                    <p className="text-xs text-gray-500 mt-1">*Mẹo: Trong thực tế nên tích hợp bộ soạn thảo như React-Quill hoặc TinyMCE để viết bài chuẩn SEO dễ hơn.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">3. Sắp xếp</label>
                        <input type="number" name="order" min="1" required value={formData.order} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 border p-2 text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 border p-2 text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white">
                            <option value="hiển thị">Hiển thị</option>
                            <option value="không hiển thị">Không hiển thị</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                    4. Thêm Tab Mới
                </button>
            </form>
        </div>
    );
}