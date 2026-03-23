import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Ép Next.js luôn lấy dữ liệu mới (Tắt Cache)
export const dynamic = "force-dynamic";

// Lấy danh sách Khách hàng (Hỗ trợ phân trang, lọc, tìm kiếm)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";

        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        // Xây dựng bộ lọc MongoDB
        const query: any = {};
        if (status) query.status = status;
        if (search) {
            // Tìm kiếm tương đối theo cả Tên hoặc Mã khách hàng
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } }
            ];
        }

        // Chạy song song truy vấn đếm và truy vấn dữ liệu, sắp xếp giảm dần theo thời gian tạo
        const [total, customers] = await Promise.all([
            db.collection("customers").countDocuments(query),
            db.collection("customers")
                .find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray()
        ]);

        const formattedCustomers = customers.map(cus => ({ ...cus, id: cus._id.toString(), _id: undefined }));

        return NextResponse.json({
            data: formattedCustomers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi lấy danh sách khách hàng", error: error.message }, { status: 500 });
    }
}

// Thêm khách hàng mới
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("dongapetroleum");

        // Loại bỏ id nếu form có gửi lên (để MongoDB tự động sinh _id)
        const { id, _id, ...customerData } = body;

        const result = await db.collection("customers").insertOne({
            ...customerData,
            createdAt: new Date()
        });

        return NextResponse.json({ message: "Thêm khách hàng thành công", id: result.insertedId }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi thêm khách hàng", error: error.message }, { status: 500 });
    }
}
