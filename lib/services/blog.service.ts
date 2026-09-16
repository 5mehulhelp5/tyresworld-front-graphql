/* ─────────────────────────────────────────────────────────────────
   BLOG SERVICE
   Real blog posts/categories from Magento's Klever module (MGS_Blog) —
   there is no other frontend source for this content; before this, the
   homepage teaser used 4 hardcoded posts and no /blog route existed at all.
───────────────────────────────────────────────────────────────── */
import { magentoFetch } from "@/lib/graphql/client";
import { KLEVER_BLOG_POSTS_QUERY, KLEVER_BLOG_CATEGORIES_QUERY } from "@/lib/queries";

export interface KleverBlogCategoryRef {
  category_id?: number | null;
  title?: string | null;
  url_key?: string | null;
}

export interface KleverBlogPost {
  post_id?: number | null;
  title?: string | null;
  url_key?: string | null;
  short_content?: string | null;
  content?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  tags?: string | null;
  author?: string | null;
  meta_keywords?: string | null;
  meta_description?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  categories?: KleverBlogCategoryRef[] | null;
}

export interface KleverBlogCategory {
  category_id?: number | null;
  title?: string | null;
  url_key?: string | null;
  meta_keywords?: string | null;
  meta_description?: string | null;
  sort_order?: number | null;
}

interface BlogPostsResponse {
  kleverBlogPosts?: { total_count?: number | null; items?: KleverBlogPost[] | null } | null;
}
interface BlogCategoriesResponse {
  kleverBlogCategories?: KleverBlogCategory[] | null;
}

export interface BlogPostsResult {
  posts: KleverBlogPost[];
  total: number;
}

/** Real blog posts. `posts: []` on any failure (missing/invalid API key,
    network error) — the empty state is honest, never a fake fallback. */
export async function getBlogPosts(params?: {
  categoryUrlKey?: string;
  urlKey?: string;
  search?: string;
  pageSize?: number;
  currentPage?: number;
  store?: string;
}): Promise<BlogPostsResult> {
  const r = await magentoFetch<BlogPostsResponse>(
    KLEVER_BLOG_POSTS_QUERY,
    {
      categoryUrlKey: params?.categoryUrlKey,
      urlKey: params?.urlKey,
      search: params?.search,
      pageSize: params?.pageSize ?? 10,
      currentPage: params?.currentPage ?? 1,
    },
    { store: params?.store, revalidate: 600 },
  );
  if (!r.ok || r.errors?.length) return { posts: [], total: 0 };
  return {
    posts: r.data?.kleverBlogPosts?.items ?? [],
    total: r.data?.kleverBlogPosts?.total_count ?? 0,
  };
}

/** Real blog categories, or null on any failure. */
export async function getBlogCategories(store?: string): Promise<KleverBlogCategory[] | null> {
  const r = await magentoFetch<BlogCategoriesResponse>(
    KLEVER_BLOG_CATEGORIES_QUERY,
    undefined,
    { store, revalidate: 1800 },
  );
  if (!r.ok || r.errors?.length) return null;
  return r.data?.kleverBlogCategories ?? null;
}

/** Single full post by url_key (content field populated), or null. */
export async function getBlogPost(urlKey: string, store?: string): Promise<KleverBlogPost | null> {
  const { posts } = await getBlogPosts({ urlKey, pageSize: 1, store });
  return posts[0] ?? null;
}

/* ── Content decoding ──────────────────────────────────────────────
   Same Page-Builder HTML-entity decode already used for CMS pages
   (app/[locale]/[...slug]/page.tsx), plus resolving Magento's
   {{store url='...'}} widget directive to a real internal link — blog
   content is full of these (brand pages, other posts, category pages). */
export function decodeBlogHtml(html: string, locale: string): string {
  return html
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/\\"/g, '"')
    .replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n")
    .replace(/\{\{store\s+url(?:=['"]?([^'"}]*)['"]?)?\s*\}\}/g, (_match, path: string | undefined) => {
      const clean = (path ?? "").replace(/\.html$/, "");
      return clean ? `/${locale}/${clean}` : `/${locale}`;
    });
}

/** Plain-text excerpt from short_content — strips tags, collapses
    whitespace, for the listing/homepage card preview. */
export function excerptFromHtml(html: string, maxLength = 160): string {
  const text = html
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}
