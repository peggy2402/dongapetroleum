import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

// Sử dụng font Inter với subset vietnamese để không bị lỗi dấu Tiếng Việt
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.daukhidonga.vn"), // URL chính thức của bạn khi đưa lên mạng
  title: {
    default: "Dong A Petroleum - Đơn vị cung cấp Dầu Khí hàng đầu",
    template: "%s | Dong A Petroleum",
  },
  description:
    "Dong A Petroleum tự hào là đối tác tin cậy chuyên cung cấp các giải pháp năng lượng, dầu khí, hóa chất an toàn và chất lượng cao cho doanh nghiệp và khu công nghiệp.",
  keywords: [
    "Dầu khí Đông Á",
    "Dong A Petroleum",
    "cung cấp dầu khí",
    "giải pháp năng lượng",
    "dầu công nghiệp",
    "hóa chất",
  ],
  authors: [{ name: "Dong A Petroleum" }],
  creator: "Dong A Petroleum",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://www.daukhidonga.vn",
    title: "Dong A Petroleum - Giải pháp Năng lượng & Dầu khí",
    description:
      "Đối tác tin cậy cung cấp các giải pháp năng lượng, dầu khí an toàn và chất lượng cao cho doanh nghiệp.",
    siteName: "Dong A Petroleum",
    images: [
      {
        url: "/og-image.jpg", // Bạn cần đưa 1 bức ảnh tên og-image.jpg vào thư mục /public
        width: 1200,
        height: 630,
        alt: "Dong A Petroleum Hero Image",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
