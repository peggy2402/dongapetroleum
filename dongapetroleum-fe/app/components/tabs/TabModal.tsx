"use client";

import { TabData } from "@/app/admin/tabs/types";

interface TabModalProps {
    viewContent: TabData;
    onClose: () => void;
}

export default function TabModal({ viewContent, onClose }: TabModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-gray-400 font-normal text-sm">Nội dung Tab:</span> {viewContent.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 prose prose-blue dark:prose-invert max-w-none">
                    {/* Cảnh báo an toàn: Trong thực tế nếu render HTML, bạn nên dùng DOMPurify để chống XSS */}
                    <div dangerouslySetInnerHTML={{ __html: viewContent.content }} />
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 text-right">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}