import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Tài khoản Quản trị',
            credentials: {
                username: { label: "Tên đăng nhập", type: "text", placeholder: "admin" },
                password: { label: "Mật khẩu", type: "password" }
            },
            async authorize(credentials) {
                const adminUser = process.env.ADMIN_USERNAME || "admin";
                const adminPass = process.env.ADMIN_PASSWORD || "Donga@2024";

                // Kiểm tra tài khoản bằng biến môi trường bảo mật
                if (credentials?.username === adminUser && credentials?.password === adminPass) {
                    return { id: "1", name: "Phòng Sales & Marketing", email: "admin@daukhidonga.vn" };
                }

                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };