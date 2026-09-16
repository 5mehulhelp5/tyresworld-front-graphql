import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { getBlogPost, decodeBlogHtml } from "@/lib/services/blog.service";
import { storeCode } from "@/lib/i18n";
import { APP_CONFIG } from "@/src/config/app-config";

const SITE_URL = `https://${APP_CONFIG.brand.domain}`;

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const store = storeCode(params.locale as "en" | "ar");
  const post = await getBlogPost(params.slug, store);
  if (!post) return { title: "Blog" };

  return {
    title: post.meta_keywords || post.title || "Blog",
    description: post.meta_description || undefined,
    alternates: { canonical: `/${params.locale}/blog/${params.slug}` },
    openGraph: {
      title: post.title || undefined,
      description: post.meta_description || undefined,
      type: "article",
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  if (locale !== "en" && locale !== "ar") notFound();
  const isAr = locale === "ar";
  const store = storeCode(locale as "en" | "ar");

  const post = await getBlogPost(slug, store);
  if (!post || !post.content) notFound();

  const html = decodeBlogHtml(post.content, locale);
  const date = post.published_at ?? post.created_at;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.image ? [post.image] : undefined,
    datePublished: post.published_at ?? undefined,
    dateCreated: post.created_at ?? undefined,
    author: post.author ? { "@type": "Organization", name: post.author } : undefined,
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}`,
  };

  return (
    <div className="bg-white min-h-screen" dir={isAr ? "rtl" : "ltr"}>
      <JsonLd data={articleJsonLd} />

      {/* ── Top Hero Banner with Black Background ── */}
      <div className="relative w-full py-10 sm:py-12 md:py-14 bg-black flex items-center justify-center px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-wider text-center max-w-5xl leading-tight font-sans">
          {post.title}
        </h1>
      </div>

      {/* ── Breadcrumb Bar ── */}
      <div className="bg-[#f0f0f0] border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-black transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <span className="text-gray-400 font-normal">&gt;</span>
            <Link href={`/${locale}/blog`} className="hover:text-black transition-colors">
              {isAr ? "المدونة" : "Blog"}
            </Link>
            <span className="text-gray-400 font-normal">&gt;</span>
            <span className="text-gray-900 font-bold line-clamp-1 max-w-md" aria-current="page">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Post Content Area ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {date && (
          <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider mb-6">
            {new Date(date.replace(" ", "T")).toLocaleDateString(
              isAr ? "ar-AE" : "en-US",
              { month: "long", day: "numeric", year: "numeric" },
            )}
          </p>
        )}

        {post.image && (
          <div className="w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 mb-10 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.title ?? ""} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="cms-content prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#ed1c24] hover:underline"
          >
            <span>{isAr ? "← العودة إلى جميع المقالات" : "← Back to all posts"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
