"use client";

import { TabData } from "@/app/admin/tabs/types";

interface TabListProps {
    tabs: TabData[];
    onDeleteAll: () => void;
    onDelete: (id: string) => void;
    onView: (tab: TabData) => void;
}

export default function TabList({ tabs, onDeleteAll, onDelete, onView }: TabListProps) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Danh sách Tabs hiện có</h2>
                <button onClick={onDeleteAll} className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-md font-medium transition-colors">
                    Xóa tất cả
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold w-16 text-center">Vị trí</th>
                            <th className="p-4 font-semibold">Tên Tabs</th>
                            <th className="p-4 font-semibold text-center">Nội dung</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                        {tabs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có dữ liệu. Hãy thêm tab mới.</td>
                            </tr>
                        ) : (
                            tabs.map((tab) => (
                                <tr key={tab.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors">
                                    <td className="p-4 text-center font-mono font-bold text-gray-500">{tab.order}</td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">{tab.name}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => onView(tab)} className="text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                            Xem Chi tiết
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tab.status === "hiển thị" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-gray-300"}`}>
                                            {tab.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Sửa</button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={() => onDelete(tab.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}