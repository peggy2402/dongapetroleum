import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, context: { params: any }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        const { id: bodyId, _id, password, ...updateData } = body;

        // CHỈ mã hóa và cập nhật mật khẩu nếu người dùng có nhập mật khẩu mới
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const result = await db.collection("administrators").updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
        }

        return NextResponse.json({ message: "Cập nhật thành công" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi cập nhật", error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: any }) {
    try {
        const { id } = await context.params;
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        const result = await db.collection("administrators").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
        }

        return NextResponse.json({ message: "Xóa thành công" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi xóa", error: error.message }, { status: 500 });
    }
}