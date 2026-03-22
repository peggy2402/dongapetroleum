import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Ép Next.js luôn lấy dữ liệu mới (Tắt Cache)
export const dynamic = "force-dynamic";

// Lấy danh sách toàn bộ danh mục (Dùng cho Bảng và Thẻ Select Danh mục cha)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const isAll = searchParams.get("all") === "true";

        const client = await clientPromise;
        const db = client.db("dongapetroleum");
        
        // Nếu có tham số ?all=true, trả về toàn bộ không phân trang (Phục vụ cho Dropdown chọn Danh mục cha)
        if (isAll) {
            const categories = await db.collection("categories").find({}).sort({ order: 1 }).toArray();
            const formattedCategories = categories.map(cat => ({ ...cat, id: cat._id.toString(), _id: undefined }));
            return NextResponse.json(formattedCategories, { status: 200 });
        }

        // Nếu không, thực hiện Phân trang và Lọc
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";

        // Xây dựng bộ lọc MongoDB
        const query: any = {};
        if (status) query.status = status;
        if (search) query.name = { $regex: search, $options: "i" }; // Tìm kiếm tương đối, không phân biệt hoa thường

        const total = await db.collection("categories").countDocuments(query);
        const categories = await db.collection("categories")
            .find(query)
            .sort({ order: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        const formattedCategories = categories.map(cat => ({ ...cat, id: cat._id.toString(), _id: undefined }));

        // Trả về cấu trúc có chứa thông tin phân trang
        return NextResponse.json({
            data: formattedCategories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi lấy danh mục", error: error.message }, { status: 500 });
    }
}

// Thêm danh mục mới vào MongoDB
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        const result = await db.collection("categories").insertOne({ ...body, createdAt: new Date() });
        return NextResponse.json({ message: "Thêm danh mục thành công", id: result.insertedId }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi thêm danh mục", error: error.message }, { status: 500 });
    }
}