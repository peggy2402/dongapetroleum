"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
        >
            Đăng xuất
        </button>
    );
}