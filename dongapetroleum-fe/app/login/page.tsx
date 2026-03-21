"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username: formData.username,
            password: formData.password,
            redirect: false,
        });

        if (res?.error) {
            setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
            setLoading(false);
        } else {
            router.push("/admin/tabs"); // Chuyển hướng vào trang admin sau khi đăng nhập thành công
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-16 h-16 bg-blue-700 mx-auto rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg">
                    ĐA
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Hệ thống Quản trị
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Đăng nhập để quản lý Website & Gửi Email
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-zinc-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên đăng nhập (Admin)</label>
                            <div className="mt-1">
                                <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
                            <div className="mt-1">
                                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-600 dark:text-white" />
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors">
                                {loading ? "Đang xử lý..." : "Đăng nhập an toàn"}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center"><Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">← Quay lại Trang chủ</Link></div>
                </div>
            </div>
        </div>
    );
}