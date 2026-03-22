import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const categoryId = searchParams.get("categoryId") || "";

        const client = await clientPromise;
        const db = client.db("dongapetroleum");
        
        const query: any = {};
        if (categoryId) query.categoryId = categoryId;
        if (search) query.name = { $regex: search, $options: "i" };

        // Tối ưu hóa: Chạy song song lệnh đếm tổng số và lệnh lấy dữ liệu (Tiết kiệm 50% thời gian chờ DB)
        const [total, products] = await Promise.all([
            db.collection("products").countDocuments(query),
            db.collection("products")
                .find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray()
        ]);
        
        const formattedProducts = products.map(prod => ({ ...prod, id: prod._id.toString(), _id: undefined }));

        return NextResponse.json({
            data: formattedProducts, total, page, limit, totalPages: Math.ceil(total / limit) || 1
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi lấy danh sách sản phẩm", error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        const result = await db.collection("products").insertOne({ ...body, createdAt: new Date() });
        return NextResponse.json({ message: "Thêm sản phẩm thành công", id: result.insertedId }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi thêm sản phẩm", error: error.message }, { status: 500 });
    }
}
