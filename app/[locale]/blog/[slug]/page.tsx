import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
    <div className="so-page">
      <JsonLd data={articleJsonLd} />

      <div className="so-hero">
        <div className="so-container">
          <nav className="so-crumbs" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{isAr ? "الرئيسية" : "Home"}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <Link href={`/${locale}/blog`}>{isAr ? "المدونة" : "Blog"}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{post.title}</span>
          </nav>
          <h1 className="so-h1">{post.title}</h1>
        </div>
      </div>

      <div className="so-container so-body max-w-3xl">
        {date && (
          <p className="text-sm text-gray-500 font-medium mb-6">
            {new Date(date.replace(" ", "T")).toLocaleDateString(
              isAr ? "ar-AE" : "en-US",
              { month: "long", day: "numeric", year: "numeric" },
            )}
          </p>
        )}

        {post.image && (
          <div className="w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.title ?? ""} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="cms-content" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#ed1c24] hover:underline"
          >
            {isAr ? "→ العودة إلى المدونة" : "← Back to Blog"}
          </Link>
        </div>
      </div>
    </div>
  );
}
