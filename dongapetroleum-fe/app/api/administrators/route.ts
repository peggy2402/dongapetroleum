import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        // Lấy danh sách tài khoản
        const admins = await db.collection("administrators").find({}).sort({ createdAt: -1 }).toArray();
        
        // In thẳng ra Terminal (bảng điều khiển VS Code) để anh tận mắt kiểm tra
        console.log("\n=== KIỂM TRA BẢNG ADMINISTRATORS ===");
        console.log(`👉 Đã tìm thấy ${admins.length} tài khoản trong Database.\n`);

        // Chuyển _id thành id và LOẠI BỎ trường password trước khi gửi về Frontend
        const formattedAdmins = admins.map(admin => {
            const { password, _id, ...rest } = admin;
            return { id: _id.toString(), ...rest };
        });

        return NextResponse.json(formattedAdmins, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi lấy danh sách", error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        // Kiểm tra xem username đã tồn tại chưa
        const existingUser = await db.collection("administrators").findOne({ username: body.username });
        if (existingUser) {
            return NextResponse.json({ message: "Tên đăng nhập này đã tồn tại!" }, { status: 400 });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(body.password, 10);
        
        // Tạo user mới
        const newUser = { ...body, password: hashedPassword, createdAt: new Date() };
        const result = await db.collection("administrators").insertOne(newUser);
        
        return NextResponse.json({ message: "Tạo tài khoản thành công", id: result.insertedId }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi tạo tài khoản", error: error.message }, { status: 500 });
    }
}