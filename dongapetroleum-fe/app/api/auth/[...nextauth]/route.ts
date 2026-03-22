import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Tên đăng nhập", type: "text" },
                password: { label: "Mật khẩu", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Vui lòng nhập đầy đủ thông tin");
                }

                const client = await clientPromise;
                const db = client.db("dongapetroleum");
                
                // 1. Tìm tài khoản trong collection administrators
                const user = await db.collection("administrators").findOne({ username: credentials.username });

                if (!user) {
                    throw new Error("Tài khoản không tồn tại");
                }

                // 2. Kiểm tra trạng thái hoạt động
                if (user.status !== "active") {
                    throw new Error("Tài khoản này đã bị khóa");
                }

                // 3. Kiểm tra mật khẩu
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error("Mật khẩu không chính xác");
                }

                // 4. Trả về thông tin an toàn (không bao gồm mật khẩu)
                return { 
                    id: user._id.toString(), 
                    name: user.username, 
                    email: user.email,
                    role: user.role // Thêm role (admin/staff) vào token
                } as any;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = (user as any).role;
            return token;
        },
        async session({ session, token }) {
            if (session.user) (session.user as any).role = token.role;
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };