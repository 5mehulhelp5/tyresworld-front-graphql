import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getBlogPosts, getBlogCategories, excerptFromHtml } from "@/lib/services/blog.service";
import { storeCode } from "@/lib/i18n";

/**
 * Real blog listing — Magento's Klever module (kleverBlogPosts /
 * kleverBlogCategories). Previously there was no /blog route at all; every
 * link to it (the homepage teaser, the footer) was dead.
 */

const PAGE_SIZE = 12;

export async function generateMetadata({
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string };
}): Promise<Metadata> {
  return {
    title: "Blog",
    description: "Tyre buying advice, car maintenance tips, and driving guides for the UAE.",
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string; page?: string };
}) {
  const { locale } = params;
  if (locale !== "en" && locale !== "ar") notFound();
  const isAr = locale === "ar";
  const store = storeCode(locale as "en" | "ar");

  const currentPage = Math.max(1, Number(searchParams.page ?? 1));
  const categoryUrlKey = searchParams.category;

  const [{ posts, total }, categories] = await Promise.all([
    getBlogPosts({ categoryUrlKey, pageSize: PAGE_SIZE, currentPage, store }),
    getBlogCategories(store),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = categories?.find((c) => c.url_key === categoryUrlKey);

  return (
    <div className="so-page">
      <div className="so-hero">
        <div className="so-container">
          <nav className="so-crumbs" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{isAr ? "الرئيسية" : "Home"}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{isAr ? "المدونة" : "Blog"}</span>
          </nav>
          <h1 className="so-h1">
            {activeCategory?.title ?? (isAr ? "المدونة" : "Blog")}
          </h1>
        </div>
      </div>

      <div className="so-container so-body">
        {/* ── Real categories (kleverBlogCategories) ─────────────── */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href={`/${locale}/blog`}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                !categoryUrlKey
                  ? "bg-[#ed1c24] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isAr ? "الكل" : "All"}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.category_id}
                href={`/${locale}/blog?category=${c.url_key}`}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                  categoryUrlKey === c.url_key
                    ? "bg-[#ed1c24] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c.title}
              </Link>
            ))}
          </div>
        )}

        {/* ── Posts grid ──────────────────────────────────────────── */}
        {posts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-sm font-bold">
              {isAr ? "لا توجد مقالات." : "No posts found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const href = `/${locale}/blog/${post.url_key}`;
              const date = post.published_at ?? post.created_at;
              return (
                <div
                  key={post.post_id}
                  className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <Link href={href} className="block relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.thumbnail ?? post.image ?? ""}
                      alt={post.title ?? ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex flex-col flex-1 p-5">
                    {date && (
                      <span className="text-xs font-semibold text-gray-500 mb-2">
                        {new Date(date.replace(" ", "T")).toLocaleDateString(
                          isAr ? "ar-AE" : "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    )}
                    <h2 className="text-sm sm:text-[15px] font-bold text-black leading-snug mb-2.5 line-clamp-2">
                      <Link href={href} className="text-black group-hover:text-[#ed1c24] transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    {post.short_content && (
                      <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed line-clamp-3 m-0">
                        {excerptFromHtml(post.short_content)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const qs = new URLSearchParams();
              if (categoryUrlKey) qs.set("category", categoryUrlKey);
              if (p > 1) qs.set("page", String(p));
              const href = `/${locale}/blog${qs.toString() ? `?${qs}` : ""}`;
              return (
                <Link
                  key={p}
                  href={href}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    p === currentPage
                      ? "bg-[#ed1c24] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
