import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        // Kiểm tra xem đã có admin nào chưa để tránh tạo trùng
        const existingAdmin = await db.collection("administrators").findOne({ username: "admin" });
        if (existingAdmin) {
            return NextResponse.json({ message: "Tài khoản admin đã tồn tại!" }, { status: 400 });
        }

        // Mã hóa mật khẩu (Ví dụ mật khẩu mặc định là Donga@2024)
        const hashedPassword = await bcrypt.hash("Donga@2024", 10);

        // Cấu trúc Collection administrators theo yêu cầu của bạn
        const newAdmin = {
            code: "ADM001",                   // Mã
            username: "admin",                // Tên đăng nhập
            password: hashedPassword,         // Mật khẩu (đã mã hóa)
            email: "admin@daukhidonga.vn",    // Email
            phone: "0989991246",              // Phone
            address: "Hải Phòng",             // Địa chỉ
            role: "admin",                    // Quyền (admin | staff)
            status: "active",                 // Trạng thái (active | inactive)
            createdAt: new Date(),
        };

        await db.collection("administrators").insertOne(newAdmin);

        return NextResponse.json({ message: "🎉 Đã khởi tạo tài khoản Admin thành công!" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi tạo tài khoản", error: error.message }, { status: 500 });
    }
}
