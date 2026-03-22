import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        // Chọn database dongapetroleum
        const db = client.db("dongapetroleum");
        // Ping thử một lệnh đến database
        await db.command({ ping: 1 });
        
        return NextResponse.json({ message: "🎉 Kết nối MongoDB thành công!", status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "⚠️ Lỗi kết nối MongoDB", error: error.message }, { status: 500 });
    }
}