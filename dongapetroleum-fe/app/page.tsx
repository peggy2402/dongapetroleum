"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

export default function Home() {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("vi");

  // State lưu dữ liệu từ API
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // Lấy danh mục (Chỉ lấy danh mục đang hiển thị)
        const catRes = await fetch("/api/categories?all=true&status=active");
        if (catRes.ok) {
            const catData = await catRes.json();
            // Ưu tiên hiển thị các danh mục gốc (không có parentId) ra trang chủ
            setCategories(catData.filter((c: Category) => !c.parentId).slice(0, 4));
        }

        // Lấy sản phẩm
        const prodRes = await fetch("/api/products?limit=20&status=active");
        if (prodRes.ok) {
            const prodData = await prodRes.json();
            const allProds = prodData.data || [];
            // Lọc ra các sản phẩm được đánh dấu Nổi bật hoặc Mới
            const featured = allProds.filter((p: Product) => p.isFeatured || p.isNewProduct);
            setFeaturedProducts(featured.length > 0 ? featured.slice(0, 8) : allProds.slice(0, 8));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 font-sans flex flex-col">
      {/* Thanh Điều Hướng (Header) */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center font-bold text-white">
              ĐA
            </div>
            <span className="text-xl font-bold text-blue-800 dark:text-blue-500">Dong A Petroleum</span>
          </div>

          {/* Phần Tabs (Sẽ được gọi từ API/Prisma trong tương lai) */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium">Trang chủ</Link>
            <Link href="#gioi-thieu" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium">Giới thiệu</Link>
            <Link href="#san-pham" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium">Sản phẩm</Link>
            <Link href="#lien-he" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium">Liên hệ</Link>
          </nav>

          {/* Nút chuyển đổi ngôn ngữ */}
          <button onClick={() => setIsLangModalOpen(true)} className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="bg-transparent text-gray-700 dark:text-gray-200 text-sm focus:outline-none cursor-pointer font-medium">
              {selectedLang === 'vi' ? 'Tiếng Việt' : selectedLang === 'en' ? 'English' : '中文 (CN)'}
            </span>
          </button>
        </div>
      </header>

      {/* Banner Khởi đầu (Hero Section) */}
      <main className="flex-1">
        <div className="relative bg-blue-50 dark:bg-zinc-800 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              Đơn vị cung cấp <span className="text-blue-600 dark:text-blue-500">Dầu Khí</span> hàng đầu
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Dong A Petroleum tự hào là đối tác tin cậy chuyên cung cấp các giải pháp năng lượng, dầu khí an toàn và chất lượng cao cho doanh nghiệp và khu công nghiệp.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <a href="#lien-he" className="px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-blue-700 hover:bg-blue-800 md:text-lg transition-colors shadow-md">
                Nhận Báo Giá
              </a>
              <a href="#san-pham" className="px-8 py-3.5 border border-gray-300 dark:border-zinc-600 text-base font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 md:text-lg transition-colors">
                Xem Sản phẩm
              </a>
            </div>
          </div>
        </div>

        {/* Khối Danh mục sản phẩm nổi bật */}
        <div id="danh-muc" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white relative inline-block">
                Lĩnh vực Kinh doanh
                <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-600 rounded-full"></span>
              </h2>
            </div>
            <Link href="/categories" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium flex items-center gap-1">
              Xem tất cả <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(cat => (
                <Link href={`/${cat.slug}`} key={cat.id} className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all block">
                  <img src={cat.image || "/default-categories-img.jpg"} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2">{cat.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Khối Sản phẩm chiến lược / Mới */}
        <div id="san-pham" className="bg-gray-50 dark:bg-zinc-900/50 py-16 border-y border-gray-100 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sản phẩm Nổi bật</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Khám phá các dòng sản phẩm dầu nhớt và hóa chất chất lượng cao được tin dùng nhất.</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-2xl"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(prod => (
                  <div key={prod.id} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-zinc-700 overflow-hidden flex flex-col group">
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-zinc-900 flex items-center justify-center p-4">
                      <img src={prod.image || "/default-categories-img.jpg"} alt={prod.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {prod.isNewProduct && <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-sm">MỚI</span>}
                        {prod.isFeatured && <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded shadow-sm">HOT</span>}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 truncate">
                        {categories.find(c => c.id === prod.categoryId)?.name || "Chưa phân loại"}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/san-pham/${prod.slug}`}>{prod.name}</Link>
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{prod.description}</p>
                      <Link href={`/san-pham/${prod.slug}`} className="w-full text-center py-2.5 bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors border border-gray-200 dark:border-zinc-600 hover:border-blue-600">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Khu vực Tại sao chọn chúng tôi (Giữ lại từ bản gốc) */}
        <div id="gioi-thieu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tại sao chọn Đông Á Petroleum?</h2>
            <div className="mt-3 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-700 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 mx-auto rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Tốc độ & Kịp thời</h3>
              <p className="text-gray-600 dark:text-gray-400">Đảm bảo nguồn cung ứng liên tục, đáp ứng nhu cầu kịp thời cho mọi hoạt động sản xuất.</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-700 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 mx-auto rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Chất lượng Quốc tế</h3>
              <p className="text-gray-600 dark:text-gray-400">Sản phẩm đạt chuẩn quốc tế, được kiểm định nghiêm ngặt mang lại sự an tâm tuyệt đối.</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-700 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 mx-auto rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Đội ngũ Chuyên gia</h3>
              <p className="text-gray-600 dark:text-gray-400">Hỗ trợ khách hàng tận tâm, chuyên môn sâu và giàu kinh nghiệm trong lĩnh vực dầu khí.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Chân trang (Footer) */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center text-xs">ĐA</span>
              Dong A Petroleum
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">Đơn vị cung cấp giải pháp năng lượng hàng đầu, kiến tạo nền tảng phát triển bền vững cho doanh nghiệp của bạn.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Thông tin Liên hệ</h4>
            <ul className="text-gray-400 text-sm space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">📍</span>
                Km9, QL10, Lưu Kiếm, Thủy Nguyên, Hải Phòng
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">📞</span>
                +84.989.991.246 - +84.912.833.338
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✉️</span>
                info@daukhidonga.vn
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Liên kết nhanh</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><Link href="#gioi-thieu" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
              <li><Link href="#san-pham" className="hover:text-white transition-colors">Sản phẩm dịch vụ</Link></li>
              <li><Link href="#tin-tuc" className="hover:text-white transition-colors">Tin tức nội bộ</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} DONG A PETROLEUM CO., LTD. All rights reserved.
        </div>
      </footer>

      {/* Modal Chọn Ngôn Ngữ */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Chọn ngôn ngữ / Language
              </h3>
              <button onClick={() => setIsLangModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button onClick={() => { setSelectedLang('vi'); setIsLangModalOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${selectedLang === 'vi' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-transparent'}`}>
                🇻🇳 Tiếng Việt
              </button>
              <button onClick={() => { setSelectedLang('en'); setIsLangModalOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${selectedLang === 'en' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-transparent'}`}>
                🇬🇧 English
              </button>
              <button onClick={() => { setSelectedLang('zh'); setIsLangModalOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${selectedLang === 'zh' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-transparent'}`}>
                🇨🇳 中文 (CN)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
