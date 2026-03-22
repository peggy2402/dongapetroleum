import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Cập nhật danh mục (PUT)
export async function PUT(request: Request, context: { params: any }) {
    try {
        // Await params để tương thích hoàn hảo với Next.js 15+
        const { id } = await context.params;
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        // Loại bỏ trường id ra khỏi body để không cập nhật đè _id của MongoDB
        const { id: bodyId, _id, ...updateData } = body;

        const result = await db.collection("categories").updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Không tìm thấy danh mục" }, { status: 404 });
        }

        return NextResponse.json({ message: "Cập nhật thành công" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi cập nhật", error: error.message }, { status: 500 });
    }
}

// Xóa danh mục (DELETE)
export async function DELETE(request: Request, context: { params: any }) {
    try {
        // Await params để tương thích hoàn hảo với Next.js 15+
        const { id } = await context.params;
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        const result = await db.collection("categories").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Không tìm thấy danh mục" }, { status: 404 });
        }

        return NextResponse.json({ message: "Xóa thành công" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi xóa danh mục", error: error.message }, { status: 500 });
    }
}