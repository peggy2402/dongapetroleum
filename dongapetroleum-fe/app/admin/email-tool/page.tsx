"use client";

import { useState, useRef } from "react";

export default function EmailTool() {
    const [formData, setFormData] = useState({
        to: "",
        customerName: "",
        subject: "",
        messageContent: "",
    });
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        } else {
            setFiles([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const submitData = new FormData();
            submitData.append("to", formData.to);
            submitData.append("customerName", formData.customerName);
            submitData.append("subject", formData.subject);
            submitData.append("messageContent", formData.messageContent);
            files.forEach((file) => {
                submitData.append("attachments", file);
            });

            const res = await fetch("/api/send", {
                method: "POST",
                body: submitData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Có lỗi xảy ra khi gửi email.");
            }

            setStatus("success");
            // Xóa form sau khi gửi thành công
            setFormData({ to: "", customerName: "", subject: "", messageContent: "" });
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-900 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-800 dark:text-blue-500 mb-3">
                        Đông Á Petroleum
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Công cụ gửi email chăm sóc khách hàng / Báo giá (Nội Bộ)
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-zinc-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tên Khách Hàng</label>
                                <input type="text" name="customerName" id="customerName" required value={formData.customerName} onChange={handleChange} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white p-3 border" placeholder="VD: Anh Nam" />
                            </div>

                            <div>
                                <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email Nhận</label>
                                <input type="email" name="to" id="to" required value={formData.to} onChange={handleChange} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white p-3 border" placeholder="khachhang@example.com" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tiêu đề (Subject)</label>
                            <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white p-3 border" placeholder="Báo giá sản phẩm Dầu Khí Đông Á..." />
                        </div>

                        <div>
                            <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nội dung thư</label>
                            <textarea name="messageContent" id="messageContent" rows={6} required value={formData.messageContent} onChange={handleChange} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white p-3 border" placeholder="Nhập nội dung email vào đây. Chữ ký sẽ được hệ thống tự động chèn vào cuối thư." />
                        </div>

                        <div>
                            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Đính kèm tệp (Tùy chọn, có thể chọn nhiều)</label>
                            <input type="file" name="attachments" id="attachments" multiple ref={fileInputRef} onChange={handleFileChange} className="mt-2 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
                            {files.length > 0 && (
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Đã chọn {files.length} tệp</p>
                            )}
                        </div>

                        {status === "success" && (
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                🎉 Đã gửi email thành công!
                            </div>
                        )}

                        {status === "error" && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                ⚠️ Lỗi: {errorMessage}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-900 transition-colors"
                            >
                                {status === "loading" ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Đang xử lý...
                                    </span>
                                ) : "Gửi Email Ngay"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}