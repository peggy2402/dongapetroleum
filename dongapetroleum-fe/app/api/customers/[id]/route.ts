import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Cập nhật thông tin khách hàng
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        // Bóc tách để loại bỏ id, _id và createdAt nhằm tránh lỗi ghi đè immutable field của MongoDB
        const { id: bodyId, _id, createdAt, ...updateData } = body;

        const result = await db.collection("customers").updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Không tìm thấy khách hàng để cập nhật" }, { status: 404 });
        }

        return NextResponse.json({ message: "Cập nhật khách hàng thành công" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi cập nhật khách hàng", error: error.message }, { status: 500 });
    }
}

// Xóa khách hàng
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        const result = await db.collection("customers").deleteOne(
            { _id: new ObjectId(id) }
        );

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Không tìm thấy khách hàng để xóa" }, { status: 404 });
        }

        return NextResponse.json({ message: "Xóa khách hàng thành công" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi xóa khách hàng", error: error.message }, { status: 500 });
    }
}
