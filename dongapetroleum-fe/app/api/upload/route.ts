import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ message: "Không tìm thấy file" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Tạo tên file không bị trùng lặp (ví dụ: anh-dau-16812345.jpg)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.name.replace(/\.[^/.]+$/, "") + "-" + uniqueSuffix + path.extname(file.name);
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // Nếu thư mục public/uploads chưa có thì tự động tạo
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({ url: `/uploads/${filename}` }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi upload file", error: error.message }, { status: 500 });
    }
}